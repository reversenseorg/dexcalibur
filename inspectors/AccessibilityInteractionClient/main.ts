import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import ModelMethod from "../../src/ModelMethod.js";

// ===== INIT =====

var AccessibilityInteractionClientInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.1",
    hookSet: {
        id: "AccessibilityInteractionClient",
        name: "Acc Interact Client",
        description: "Accessibility Interaction Client class from android.view.accessibility",
        strategies: [
        {
            name: "View getRootView",
            descr: "Hook the views that try to get the RootView.",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^android.view.View/").filter("name:getRootView")'
            },
            autoEmit: true,
            emitEvent: "hook.view.getRootView",
            after:`  
                    //<psh>={
                    if (ret!=null) {
                        console.log(" -**--*-* -*- -* GetRootView *-**-*")
                        console.log(ret);
                        const trace = DXC.java.getStackTrace();
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {
                                str: ret,
                                __trace__:[trace[(trace.length>2 ? 1 : 0)]]
                            }
                        );
                    }
                `
        },
        /*    {
                name: "View addChildrenForAccessibility",
                descr: "Hook the views that declare children for accessibility.",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    req: 'method("enclosingClass.name:/^android.view.View/").filter("name:addChildrenForAccessibility")'
                },
                autoEmit: true,
                emitEvent: "hook.view.addChildrenForAccessibility",
                before:`  
                    //<psh>={
                    
                    DXC.send(
                        "@@__HOOK_ID__@@",
                        "@@__FRAG_ID__@@",
                        {
                            message: "addChildrenForAccessibility triggered"
                        }
                    );
                `
            },*/
            {
                name: "View sendAccessibilityEvent",
                descr: "Hook the views which send Accessibility events.",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    req: 'method("name:sendAccessibilityEvent")'
                },
                autoEmit: true,
                emitEvent: "hook.view.sendAccessibilityEvent",
                before:`  
                    //<psh>={
                    let eventTypes = "";
                    let dataEvent:Record<string, any> = {};
                    let accessibilityEvent = arguments[arguments.length - 1];
                    if (typeof accessibilityEvent === "number") {
                        eventTypes = Java.use("android.view.accessibility.AccessibilityEvent").eventTypeToString(accessibilityEvent);
                    }
                    else if (DXC.util.isInstanceOf(accessibilityEvent, 'android.view.accessibility.AccessibilityEvent')) {
                        eventTypes = accessibilityEvent.toString();
                    }
                    if (arguments.length === 1) {
                        dataEvent = {'arg0_event': accessibilityEvent, 'eventTypes': eventTypes, 'this': this.$className};
                    } else if (arguments.length === 2) {
                        dataEvent = {'arg0_view': arguments[0], 'arg1_event': accessibilityEvent, 'eventTypes': eventTypes};
                    }
                    DXC.send(
                        "@@__HOOK_ID__@@",
                        "@@__FRAG_ID__@@",
                        dataEvent
                    );
                `
            }
        ]
    },
    eventListeners: {
    }
});

export default AccessibilityInteractionClientInspector;

/*
enum accessibilityEventType {
    TYPE_VIEW_CLICKED, // 1 /* << 0 ;
    TYPE_VIEW_LONG_CLICKED, // 1 << 1
    TYPE_VIEW_SELECTED, // 1 << 2
    TYPE_VIEW_FOCUSED, // 1 << 3
    TYPE_VIEW_TEXT_CHANGED, // 1 << 4
    TYPE_WINDOW_STATE_CHANGED, // 1 << 5
    TYPE_NOTIFICATION_STATE_CHANGED, // 1 << 6
    TYPE_VIEW_HOVER_ENTER, // 1 << 7
    TYPE_VIEW_HOVER_EXIT, // 1 << 8
    TYPE_TOUCH_EXPLORATION_GESTURE_START, // 1 << 9
    TYPE_TOUCH_EXPLORATION_GESTURE_END, // 1 << 10
    TYPE_WINDOW_CONTENT_CHANGED, // 1 << 11
    TYPE_VIEW_SCROLLED, // 1 << 12
    TYPE_VIEW_TEXT_SELECTION_CHANGED, // 1 << 13
    TYPE_ANNOUNCEMENT, // 1 << 14
    TYPE_VIEW_ACCESSIBILITY_FOCUSED, // 1 << 15
    TYPE_VIEW_ACCESSIBILITY_FOCUS_CLEARED, // 1 << 16
    TYPE_VIEW_TEXT_TRAVERSED_AT_MOVEMENT_GRANULARITY, // 1 << 17
    TYPE_GESTURE_DETECTION_START, // 1 << 18
    TYPE_GESTURE_DETECTION_END, // 1 << 19
    TYPE_TOUCH_INTERACTION_START, // 1 << 20
    TYPE_TOUCH_INTERACTION_END, // 1 << 21
    TYPE_WINDOWS_CHANGED, // 1 << 22
    TYPE_VIEW_CONTEXT_CLICKED, // 1 << 23
    TYPE_ASSIST_READING_CONTEXT, // 1 << 24
    TYPE_SPEECH_STATE_CHANGE, // 1 << 25
    TYPE_VIEW_TARGETED_BY_SCROLL // 1 << 26
}
*/
