import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import ModelMethod from "../../src/ModelMethod.js";

// ===== INIT =====

var JavaRegexMatcherInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.87",
    hookSet: {
        id: "JavaRegexMatcher",
        name: "Java Regex Matcher",
        description: "Java regular expression library",
        strategies: [
        {
            name: "JavaRegexMatcher matches",
            descr: "Hook the method that attempts to match the entire region against the pattern.",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^java.util.regex.Matcher/").filter("name:matches")'
            },
            autoEmit: true,
            emitEvent: "hook.javaRegexMatcher.matches",
            after: ` 
                let eventData : Record<string, any> = {};
                let rgPatternCl = Java.use('java.util.regex.Pattern');
                let pattern = Java.cast(this.parentPattern?.value, rgPatternCl); 
                eventData['text'] = this.text.value; // String 
                eventData['regex'] = pattern?._pattern?.value;// String 
                eventData['ret_matches'] = ret; // boolean
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    eventData
                );
              `
        },
        {
            name: "JavaRegex Matcher find",
            descr: "Hook the method that attempts to find the next subsequence of the input sequence that matches the pattern. Can get a specified index to start finding",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^java.util.regex.Matcher$/").filter("name:find")'
            },
            autoEmit: true,
            emitEvent: "hook.javaRegexMatcher.find",
            after: ` 
                let eventData : Record<string, any> = {};
                let rgPatternCl = Java.use('java.util.regex.Pattern');
                let pattern = Java.cast(this.parentPattern?.value, rgPatternCl); 
                eventData['text'] = this.text.value; // String 
                eventData['regex'] = pattern?._pattern?.value;// String 
                eventData['ret_find'] = ret; // boolean
                if (arguments.length === 1) {
                    eventData['arg0_start'] = arguments[0] // int 
                }
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    eventData
                );
              `
        },
        {
            name: "JavaRegex Matcher lookingAt",
            descr: "Hook the method that attempts to match the input sequence, starting at the beginning of the region, against the pattern.",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^java.util.regex.Matcher$/").filter("name:lookingAt")'
            },
            autoEmit: true,
            emitEvent: "hook.javaRegexMatcher.lookingAt",
            after: ` 
                let eventData : Record<string, any> = {};
                let rgPatternCl = Java.use('java.util.regex.Pattern');
                let pattern = Java.cast(this.parentPattern?.value, rgPatternCl); 
                eventData['text'] = this.text.value; // String 
                eventData['regex'] = pattern?._pattern?.value;// String 
                eventData['ret_lookingAt'] = ret; // boolean
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    eventData
                );
              `
        },
        // {
        //     name: "JavaRegex Matcher groupCount",
        //     descr: "Hook the method that attempts to match the input sequence, starting at the beginning of the region, against the pattern.",
        //     search: {
        //         type: ModelMethod.TYPE.getName(),
        //         req: 'method("enclosingClass.name:/^java.util.regex.Matcher$/").filter("name:groupCount")'
        //     },
        //     autoEmit: true,
        //     emitEvent: "hook.javaRegexMatcher.groupCount",
        //     after: `
        //         let eventData : Record<string, any> = {};
        //         let rgPatternCl = Java.use('java.util.regex.Pattern');
        //         let pattern = Java.cast(this.parentPattern?.value, rgPatternCl);
        //         eventData['text'] = this.text.value; // String
        //         eventData['regex'] = pattern?._pattern?.value;// String
        //         eventData['ret_groupCount'] = ret; // boolean
        //         DXC.send(
        //             "@@__HOOK_ID__@@",
        //             "@@__FRAG_ID__@@",
        //             eventData
        //         );
        //   `
        // }
        ]
    },
    eventListeners: {
    }
});


export default JavaRegexMatcherInspector;