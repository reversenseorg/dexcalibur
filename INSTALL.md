# Dexcalibur installation guide

## First, get the minimal requirements

Install this requirements before to continue.

Desktop requirements :
-   NodeJS
-   Frida > 11.0.2
-   Java 
-   APKTool

Device requirements :
-   Frida-server > 11.0.2 (if injected)

## Next, build the dependencies

First, you need to rebuild the dependencies for your version of node.

Execute the following command from the repository containing the INSTALL.md file.
```
npm rebuild
``` 

## Next, extract and convert Android APIs

You need to get and convert the **android.jar** file for each API version needed to a .dex file and store it in a folder using the call convention :
```
<DEXCALIBUR_HOME>/APIs/android_<api_version>/android.dex
```

You can use the ApiHelper from the command line, by using the script : 
```
./export_android --src=<SDK_HOME> --out=<DEXCALIBUR_HOME> [--api=<verion>] 
```

## Finally, you can run the application from the Node client

```
$ node --max-old-space-size=8192

> var Dexcalibur = require("./src/project.js");

> var Project = new Dexcalibur("com.app.test");

> Project.useAPI("android:7.0.0").fullscan().web.start(8000)
```

## Or by using the Dexcalibur script :


The *dexcalibur* script can scan an app, installed on the connected device or downloaded in the dexcalibur workspace 
```
$ ./dexcalibur --api=android:7.0.0 --app=com.app.test --port=8000
```
