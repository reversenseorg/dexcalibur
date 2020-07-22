

// ===== INIT =====

import InspectorFactory from "../../src/InspectorFactory";
import {INSPECTOR_TYPE} from "../../src/Inspector";

export default new InspectorFactory({
    startStep: INSPECTOR_TYPE.BOOT,

    useGUI: true,

    hookSet: {
        id: "BytecodeCleaner",
        name: "Bytecode cleaner",
        description: "It offers several cleanup solution : remove NOP, replace goto, detect wrapper, detect duplicate function ..."
    }
});
