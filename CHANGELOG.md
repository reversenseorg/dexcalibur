CHANGELOG

# Version 0.6

## 0.7.2

* Improve device management and communication with remote device over TCP instead of USB
* Add enrollment of device over TCP

## 0.7.1

* Improve detection of non-blocking errors when apktool is running
* Remove sponsors temporary to prevent legal issue 
* Improve unit test
* fix broken links
* Turn unreachable registry to non-blocking error

## 0.7.0

* Re-design of project management, de vice management, platform management and more
* Same dexcalibur engine instance can handle/hook simultaneously several projects
* Better device detection
* Add installer : UI + automatic install of dependencies, auto conf
* More ... see http://docs.dexcalibur.org/News.html


## 0.6.5

* Improve test unit
* Add DEXCALIUR_PORT and DEXCALIBUR_HOST variable

## 0.6.4

* Improve test unit
* Remove frida* fields from configuartion file

## 0.6.3

* Add DEXCALIBUR_TEST environment variable : a way to turn some part of code into test mode
* Add additional colors to Logger.debug : Logger.debugPink(), Logger.debugBgRed()
* Add some unit test (Configuration, Logger, AdbWrapper, DeviceManager, ...)
* Extend minimalist smali VM, add support of : invoke-super
* PseudoCode maker can be turn off
* Create CHANGELOG file

## 0.6.2

### New features:

* Smali execution capability (Minimalist VM) (alpha)
* Pseudocode generation (alpha) including constant propagation, removing of useless goto, and more
* Ability to create hook into the smali VM (alpha)
* Search engine requester

### Fixes:

* Static analysis of smali is more accurate

## 0.6.1

### New feature :

* auto-save

### Fix :

* minor issues

## 0.6.0

### New features:

* Hook editor helpers: the hook editor embeds a navigation bar of hook snippets for Java and native hooks.
* Polymorphic hook: static value into hook code can filled/updater automatically with data from previous application+hook execution. Allowing to do evolutive black-list.

### Fix:

* Device Manager has been partially rewritten to be more stable. Default device where hooks should be deployed can be selected.
* Save/Open feature has been patched and UI redesigned.
* "Delete hook" works again.

## Changes:
* Migration to Bootstrap 4
* UI theme
* Remote errors are now partially rendered client-side
* UI is more compact, so more data can be displayed
* Navigation bar has been rewritten to offer fastest access to features/inspectors




