//=============================================================================
//  MuseScore
//  Music Score Editor
//
//  " M I C R O T U N E " plugin
//
//	Manages and applies micro-tonal tunings.
//	Version 0.5 - Date 27.12.2012
//
//	By Maurizio M. Gavioli, 2010.
//	By Joachim Schmitz, 2012.
//
//  MuseScore: Copyright (C)2008 Werner Schweer and others
//
//  This program is free software; you can redistribute it and/or modify
//  it under the terms of the GNU General Public License version 2.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program; if not, write to the Free Software
//  Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
//=============================================================================

// Global vars

// The g_presets array contains the data for each preset.
//	Each item of this array is itself an array with 25 items:
//		items [0] to [24] correspond to the 25 accidentals of MuseScore
//			(accidents 0 - 5 are not currently used for micro-intervals, but reserved)
//		item ["Name"] is a human-readable name of the preset.
var	g_presets = [];
var	g_numOfPresets	= 0;
var	g_defaultPreset = [0, 0, 0, 0, 0, 0, -50, 0, -150, -50, 0, -150, 50, 0, 0, 150, -50, -150, 0, 50, -50, 0, 150, 50, 0];
var	g_szDefaultPresetName	= "default";

var	g_form;
var	g_bDirty	= false;
var	g_szExportPath;
var	g_szImportPath;

var	g_szOrgName			= "MusE"
var	g_szAppName			= "pluginMicrotune";
var	g_szPathsSect		= "Paths";
var	g_szExportPathKey	= g_szPathsSect + "/ExportPath";
var	g_szImportPathKey	= g_szPathsSect + "/ImportPath";
var	g_szPresetsSect		= "Presets";
var	g_szCurrPresetKey	= g_szPresetsSect + "/CurrentPreset";
var	g_szNumOfPresetsKey	= g_szPresetsSect + "/NumOfPresets";
var	g_szPresetKey		= g_szPresetsSect + "/Preset";
var	g_szPresetNameKey	= g_szPresetsSect + "/PresetName";

//---------------------------------------------------------
//	init()
//	this function will be called on startup of mscore
//---------------------------------------------------------

function init()
{
}

//-------------------------------------------------------------------
//	run()
//	this function will be called when activating the plugin menu entry
//-------------------------------------------------------------------

function run()
{	var		cursor, dir, file, loader;

	// create the UI
	loader	= new QUiLoader(null);
	dir		= new QDir("" + pluginPath + "/res");
	loader.setWorkingDirectory(dir);
	file = new QFile(pluginPath + "/microtune.ui");
	file.open(QIODevice.OpenMode(QIODevice.ReadOnly, QIODevice.Text));
	g_form = loader.load(file, null);
	g_form.comboPresets["currentIndexChanged(int)"].connect(setValuesFromPreset);
	g_form.pushUpdate.clicked.connect(updatePreset);
	g_form.pushRename.clicked.connect(renamePreset);
	g_form.pushAdd.clicked.connect(addPreset);
	g_form.pushDelete.clicked.connect(deletePreset);
	g_form.pushExport.clicked.connect(exportPresets);
	g_form.pushImport.clicked.connect(importPresets);
	g_form.pushOk.clicked.connect(applyValues);
	g_form.pushCancel.clicked.connect(dlgDone);

	// load configuration and update dlg controls
	loadIni(null, true);
	setValuesFromPreset(g_form.comboPresets.currentIndex);

	g_form.show();								// show the dlg
}

//---------------------------------------------------------
//	applyValues()
//	called when user presses the "Apply" button
//	applies the values currently in the dlg to the score.
//---------------------------------------------------------

function applyValues()
{	var		chordnote, note, staff, voice;
	var		cursor;
	var		idx;
	var		preset;

	idx = g_form.comboPresets.currentIndex;
	preset = g_presets[idx];

	// no score open (MuseScore 2.0+, can't happen earlier)
	if (typeof curScore === 'undefined')
		return
	
	// for each note of each chord of each part of each staff
	cursor = new Cursor(curScore);
	curScore.startUndo();
	for (staff = 0; staff < curScore.staves; ++staff)
	{	cursor.staff = staff;
		for (voice = 0; voice < 4; voice++)
		{	cursor.voice = voice;
			cursor.rewind();					// set cursor to first chord/rest

			while (!cursor.eos())
			{	if (cursor.isChord())
				{	for (chordnote = 0; chordnote < cursor.chord().notes; chordnote++)
					{	note	= cursor.chord().note(chordnote);
						idx		= note.userAccidental;
						if(idx >= 6 && idx <= 25)
							note.tuning = preset[idx];
						else
							note.tuning = 0;
					}
				}
				cursor.next();
			}
		}
	}
	curScore.endUndo();
	saveIni(null, true);				// save data
	g_form.accept();
}

function dlgDone()
{	saveIni(null, true);				// save data
	g_form.reject();
}

//---------------------------------------------------------
//	updatePreset()
//	called when user presses the "Update" button: updates the preset
//	currently selected in the combo with the values in the dlg.
//---------------------------------------------------------

function updatePreset()
{	var		preset;
	var		step;

	//get selected preset and pick the right item in g_presets array
	preset = g_presets[g_form.comboPresets.currentIndex];
	for(step=6; step < 25; step++)
		preset[step] = parseInt( g_form["e"+step].text );
	g_bDirty = true;
}

//---------------------------------------------------------
//	renamePreset()
//	called when user presses the "Rename" button
//	Allows to rename the currently selected preset.
//---------------------------------------------------------

function renamePreset()
{	var		idx;
	var		name;
	var		preset;

	//get selected preset and pick the right item in g_presets array
	idx = g_form.comboPresets.currentIndex;
	preset = g_presets[idx];
	// aks the user for a new name of the preset
	name = QInputDialog.getText(g_form, "New preset name",
			"Enter a new name for the preset:", QLineEdit.Normal,
			preset["Name"], 0);
	// if returned string is not empty, update preset name
	if(name != null)
	{	preset["Name"] = name;			// update name in internal data
		g_form.comboPresets.setItemText(idx, preset["Name"]);
		g_bDirty = true;
	}
}

//---------------------------------------------------------
//	addPreset()
//	called when user presses the "Add" button
//	Adds a new presets with the values currently in the dlg.
//---------------------------------------------------------

function addPreset()
{	var		idx;
	var		preset = [];

	// init the new preset to the values currently in the dlg
	for(idx=0; idx < 6; idx++)
		preset[idx] = 0;
	for(idx=6; idx < 25; idx++)
		preset[idx] = parseInt(g_form["e"+idx].text);

	// aks the user for a name of the new preset
	preset["Name"] = QInputDialog.getText(g_form, "New preset",
			"Enter a name for the new preset:", QLineEdit.Normal,
			"[new preset]", 0);
	// if returned string is not empty, add the new preset
	if(preset["Name"] != null)
	{	g_presets[g_numOfPresets] = preset;			// add to internal data
		g_numOfPresets++;
		g_form.comboPresets.addItem(preset["Name"]);// add to combo box
		g_form.comboPresets.setCurrentIndex(g_numOfPresets-1);
		g_bDirty = true;
	}
}

//---------------------------------------------------------
//	deletePreset()
//	called when user presses the "Delete" button:
//	removes the selected preset from the combo box and from the internal data.
//	Data are saved.
//---------------------------------------------------------

function deletePreset()
{	var		idx;
	var		preset;

	//get selected temperament and ask the user for a confirmation
	idx = g_form.comboPresets.currentIndex;
	// using custom buttons to show "Yes" / "No" does not seem to work!
	if(QMessageBox.question(g_form, "Delete preset",
			"\"" + g_presets[idx]["Name"] +
			"\" will be deleted permanently\nProceed? (press ESC to abort)") != QMessageBox.Ok)
		return;

	// remove item from combo box
	g_form.comboPresets.removeItem(idx);
	// remove item from internal data, shifting all 'next' presets 'down' one slot
	for(preset = idx; preset < g_numOfPresets-1; preset++)
		g_presets[preset] = g_presets[preset+1];
	g_presets.pop();					// remove last temperament
	g_numOfPresets--;
	g_bDirty = true;
}

//---------------------------------------------------------
//	exportPresets() / importPresets()
//	called when user presses the "Export" / "Import" button:
//	exports the presets in / imports presets from an external file.
//---------------------------------------------------------

function exportPresets()
{	var		idx;

	// open a file selection dlg
	var fName = QFileDialog.getSaveFileName(g_form, "Select a data file to create",
			g_szExportPath, "DAT file (*.dat)", 0);
	if(fName == null)
		return;
	saveIni(fName, false);				// save data, but not the preferences
	// store last export path
	idx = fName.lastIndexOf("/");
	if(idx != -1)
		g_szExportPath = fName.substring(0, idx);
	g_bDirty = true;
}

function importPresets()
{
	// open a file selection dlg
	var fName = QFileDialog.getOpenFileName(g_form, "Select data file to import",
			g_szImportPath, "DAT file (*.dat)", 0);
	if(fName == null)
		return;
	loadIni(fName, false);				// load data, but not the preferences
	// store last import path
	idx = fName.lastIndexOf("/");
	if(idx != -1)
		g_szImportPath = fName.substring(0, idx);
	g_bDirty = true;
}

//---------------------------------------------------------
//	setValuesFromPreset(nPresetIdx)
//	sets the dlg data values from the values of nIdx-th preset.
//---------------------------------------------------------

function setValuesFromPreset(nIdx)
{	var		preset, step;

	preset = g_presets[nIdx];

	// set each value of the preset
	for(step = 6; step < 25; step++)
		g_form["e"+step].setText("" + preset[step]);
	g_bDirty = true;
}

//---------------------------------------------------------
//	presetExists(preset)
//	checks the preset already exists in the global preset array: only data
//	are checked, name is ignored.
//---------------------------------------------------------

function presetExists(preset)
{	var		nIdx, bSame, nStep;

	bExists = false;
	for(nIdx=0; nIdx < g_numOfPresets; nIdx++)
	{	bSame = true;
		for(nStep=0; nStep < 25; nStep++)
		{	if(preset[nStep] != g_presets[nIdx][nStep])
			{	bSame = false;			// at least this item is different
				break;
			}
		}
		if(bSame)						// if complete match
			return true;				// return preset exists
	}
	return false;
}

//---------------------------------------------------------
//	loadIni(fName, bPrefs)
//	loads an INI-like file. The file can be either a settings file
//	(if bPrefs == true) or a data file (if bPrefs == false).
//	In the first case, the file is looked for in a standard location (fName is
//	ignored), and both preferences and preset data are loaded. If no preset
//	data are found, a default preset is generated.
//	In the second case, the fName parameter is used to locate the file and
//	only preset data are loaded and duplicate presets are identified and
//	skipped.
//	In both cases, preset data are added to the internl g_preset array and
//	to the "Presets" combo box.
//	Parameters:
//		fName:	the file to load from, if bSettings == false
//		bPrefs:	if true, full config is loaded | if false, only presets
//---------------------------------------------------------

function loadIni(fName, bPrefs)
{	var		currPreset, idx, idx2, numOfPresets, preset, settings, step;

	// if preferences, look in AppData and load config entries
	if(bPrefs)
	{	settings = new QSettings(QSettings.IniFormat, QSettings.UserScope,
				g_szOrgName, g_szAppName, null);
		currPreset = settings.value(g_szCurrPresetKey, 0);
		g_szExportPath = settings.value(g_szExportPathKey, pluginPath);
		g_szImportPath = settings.value(g_szImportPathKey, pluginPath);
	}
	else
		settings = new QSettings(fName, QSettings.IniFormat);

	// presets: get number of presets and each preset in turn
	numOfPresets = parseInt(settings.value(g_szNumOfPresetsKey, 0));
	for(idx=idx2=0; idx < numOfPresets; idx++)
	{	preset = new Array();
		preset = settings.value(g_szPresetKey+idx, g_defaultPreset);
		preset["Name"] = settings.value(g_szPresetNameKey+idx, g_szDefaultPresetName);
		// on import, check the preset does not already exists
		if(!bPrefs && presetExists(preset) )
		{	if(QMessageBox.question(g_form, "Preset exists",
			"Import preset \"" + preset["Name"] +
			"\" is the same as existing preset \"" + g_presets[idx]["Name"] +
			"\"\nSkip it? (press ESC to import it anyway)") == QMessageBox.Ok)
				continue;
		}
		// add to internal data and to combo box
		g_presets[idx2+g_numOfPresets] = preset;
		g_form.comboPresets.addItem(preset["Name"]);
		idx2++;
	}
	numOfPresets = idx2;

	if(bPrefs)
	{	g_bDirty = false;
		g_numOfPresets = numOfPresets;
		// if no preset, create a default one
		if(g_numOfPresets < 1)
		{	g_numOfPresets = 0;
			preset = [];
			for(step = 0; step < 25; step++)
				preset[step] = g_defaultPreset[step];
			preset["Name"] = g_szDefaultPresetName;
			g_presets[0] = preset;			// add to internal data
			g_numOfPresets = 1;
			g_form.comboPresets.addItem(preset["Name"]);// add to combo box
			g_form.comboPresets.setCurrentIndex(0);
			g_bDirty = true;
		}
		g_form.comboPresets.setCurrentIndex(currPreset);
	}
	else
	{	g_numOfPresets += numOfPresets;
	}
}

//---------------------------------------------------------
//	saveIni(fName, bPrefs)
//	saves an INI-like file. The file can be either a settings file
//	(if bPrefs == true) or a data file (if bPrefs == false).
//	In the first case, the file is created in a standard location (fName is
//	ignored), and both preferences and preset data are stored.
//	In the second case, the fName parameter is used to locate the file and
//	only preset data are stored.
//	Parameters:
//		fName:	the file to store into, if bSettings == false
//		bPrefs:	if true, full config is stored | if false, only presets
//---------------------------------------------------------

function saveIni(fName, bPrefs)
{	var		preset, settings, step;

	// if preferences, look in AppData and store config entries
	if(bPrefs)
	{	if(!g_bDirty)					// if settings are not dirty, do nothing
			return;
		settings = new QSettings(QSettings.IniFormat, QSettings.UserScope,
				g_szOrgName, g_szAppName, null);
		settings.setValue(g_szCurrPresetKey, g_form.comboPresets.currentIndex);
		settings.setValue(g_szExportPathKey, g_szExportPath);
		settings.setValue(g_szImportPathKey, g_szImportPath);
	}
	else
		settings = new QSettings(fName, QSettings.IniFormat);

	// presets: ensure no left-over remains from deleted presets and store number
	settings.remove(g_szPresetsSect);
	settings.setValue(g_szNumOfPresetsKey, g_numOfPresets);
	// save each preset
	for(preset=0; preset < g_numOfPresets; preset++)
	{	settings.setValue(g_szPresetKey+preset, g_presets[preset]);
		settings.setValue(g_szPresetNameKey+preset, g_presets[preset]["Name"]);
	}
	settings.sync();					// flush file
	if(bPrefs)
		g_bDirty = false;
}

//---------------------------------------------------------
//    menu:  defines were the function will be placed
//           in the MuseScore menu structure
//---------------------------------------------------------

var mscorePlugin =
{	menu:	'Plugins.Microtonal tunings',
	init:	init,
	run:	run
};

mscorePlugin;
