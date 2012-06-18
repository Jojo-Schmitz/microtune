M I C R O T U N E
=================

A plugin for MuseScore
Version 0.4 - 18.06.2012
  
---

'Microtune' is a MuseScore plugin to apply micro-interval tuning to a score;
it also allows to manage ready-made sets of tuning values (presets).
  
Copyright: 'Microtune' has been made by Maurizio M. Gavioli, AKA [Miwarre]
    (http://musescore.org/en/user/2387), AKA [mgavioli]
    (https://github.com/mgavioli),
    fixes for a) voice 4 b) to check for a current Score being open have
    been and c) the move to [GitHub] (https://github.com/Jojo-Schmitz/microtune)
    provided by Joachim Schmitz, AKA [Jojo-Schmitz]
    (http://musescore.org/en/user/4901).

    Do with it whatever you like. The authors cannot be held responsible of
    ANYTHING in ANY way! You have been warned.


## INSTALLATION

1.  Extract the files in the "plugins" sub-folder of the main folder where your
    copy of MuseScore is installed in. This creates a "microtune" sub-folder of
    the "plugins" folder.
2.  Start or re-start MuseScore.

Once run, 'Microtune' creates a configuration file, pluginMicrotune.ini, in the
following folder:

- Windows:		%APPDATA%\MusE\
- Linux & Mac OS X:	$HOME/.config/MusE/


## APPLYING THE TUNING

1. Select the "Microtune" plugin from the "Plugins" menu list.
    A dialogue box will be shown with the current set of tuning values.
2.  Select the needed preset from the "Presets" drop list or insert the required
    value for each accidental you want to tune.
3.  Press the "Apply" button.


### THE TUNING VALUES

Tuning values are in `cent`. 100 cent = 1 semitone (more precisely, 1 semitone
of the equal temperament). So:

*   150 cent:  rise a note by a semitone and a half ('sharp-and-a-half')
*   50 cent:  rise a note by half a semitone ('half-sharp');
*   -50 cent:  lower a note by half a semitone ('half-flat')
*   -150 cent:  lower a note by a semitone and a half ('flat-and-a-half')

and so on.


## MANAGING THE PRESETS

Presets are sets of tuning values ready to be selected and applied.

### Adding a new preset:

1.  Set each accidental to the required tuning value.
2.  Press the "Add" button. A name for the new prset will be asked. After
    pressing "OK", the new preset will be created.

### Updating a preset:

1.  Select the preset from the "Presets" drop list.
2.  Change the values displayed to the value you need.
3.  Press the "Update" button: the selected preset will be updated with the
    values currently displayed.

### Renaming a preset:

1.  Select the preset from the "Presets" drop list.
2.  Press the "Rename" button.
3.  Enter the new name and press "OK".

### Deleting a preset:

1.  Select the preset from the "Presets" drop list.
2.  Press the "Delete" button: a dialogue box will ask to confirm.
3.  Press "OK" to confirm the deletion or "Esc" to keep the preset.

### Exporting the presets:

1.  Press the "Export" button.
2.  A dialogue box will be shown asking to select a destination file.
3.  After pressing "Save", all the presets currently defined will be exported
    to the chosen file.

### Importing presets:

1.  Press the "Import" button.
2.  A dialogue box will be shown asking to select the source file.
3.  After pressing "Open", the presets stored in the file will be imported. If
    a preset in the import file exactly duplicates all the values in a preset
    already present, a dialogue box will ask if you want to skip or to import
    it: press "OK" to skip it or "Esc" to import it.


## KNOWN LIMITATIONS

'Microtune' requires at least MuseScore version 0.9.6 beta 2 in order to run.


Any suggestion is welcome!

Enjoy!
	Maurizio M. Gavioli & Joachim Schmitz
