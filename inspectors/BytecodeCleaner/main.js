const Inspector = require("../../src/Inspector.js");
const InspectorFactory = require("../../src/InspectorFactory.js");


// ===== INIT =====

var CleanerInspector = new InspectorFactory({
    startStep: Inspector.STEP.BOOT,

    useGUI: true,

    hookSet: {
        id: "BytecodeCleaner",
        name: "Bytecode cleaner",
        description: "It offers several cleanup solution : remove NOP, replace goto, detect wrapper, detect duplicate function ..."
    }
});


module.exports = CleanerInspector;