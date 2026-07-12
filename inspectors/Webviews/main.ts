/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import ModelMethod from "../../src/ModelMethod.js";

//Source Ch0pin - medusa : https://github.com/Ch0pin/medusa/blob/20f463c590e13700f42e413212bb3d6d996d8a7f/modules/webviews/hook_webviews.med

// ===== INIT =====

var WebViewInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.7",
    hookSet: {
        id: "Webviews",
        name: "Webviews",
        description: "Displays info of webview instances loaded by the applications",
        prologue:`
            function dumpWebview(wv:any) {
                var dumpWV: Record<string, any> = {};
                dumpWV['className'] = wv.$className;
                dumpWV['getWebViewClient'] = wv.getWebViewClient();
                var wvSettings = wv.getSettings();
                dumpWV['getAllowContentAccess'] = wvSettings.getAllowContentAccess();
                dumpWV['getJavaScriptEnabled'] = wvSettings.getJavaScriptEnabled();
                dumpWV['getAllowFileAccess'] = wvSettings.getAllowFileAccess();
                dumpWV['getAllowFileAccessFromFileURLs'] = wvSettings.getAllowFileAccessFromFileURLs();
                dumpWV['getAllowUniversalAccessFromFileURLs'] = wvSettings.getAllowUniversalAccessFromFileURLs();
                dumpWV['getAllowFileAccessFromFileURLs'] = wvSettings.getAllowFileAccessFromFileURLs();
                return dumpWV;
            }
        `,
        strategies: [{
            name: "webview constructor",
            descr: "Hook webview constructors",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^android.webkit.WebView$/").filter("name:<init>")'
            },
            autoEmit: true,
            emitEvent: "hook.webview.new",
            before: ` 
                let data : Record<string, any> = {};
                data['arg0_context'] = arguments[0];
                switch(arguments.length) {
                    case 2:
                        data['arg1_context'] = arguments[1];
                        break;
                    case 3:
                        data['arg1_context'] = arguments[1];
                        data['arg2_attrs'] = arguments[2];
                        break;
                    case 4:
                        data['arg1_context'] = arguments[1];
                        data['arg2_attrs'] = arguments[2];
                        data['arg3_defStyleAttr'] = arguments[3];
                        break;
                    case 5:
                        data['arg1_context'] = arguments[1];
                        data['arg2_attrs'] = arguments[2];
                        data['arg3_defStyleAttr'] = arguments[3];
                        if (typeof arguments[5] === "boolean")
                            data['arg4_privateBrowsing'] = arguments[4];
                        else
                            data['arg4_defStyleRes'] = arguments[4];
                        break;
                }
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    data
                )
            `
        },
        {
            name: "webSettings setAllowContentAccess",
            descr: "set Content Access",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^android.webkit.WebSettings$/").filter("name:setAllowContentAccess")'
            },
            autoEmit: true,
            emitEvent: "hook.webviews.websettings.set.allowContentAccess",
            before: ` 
                let data : Record<string, any> = {};
                data['arg0_allow'] = arguments[0];
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    data
                )
            `
        },
        {
            name: "webSettings setAllowFileAccess",
            descr: "set File Access",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^android.webkit.WebSettings$/").filter("name:setAllowFileAccess")'
            },
            autoEmit: true,
            emitEvent: "hook.webviews.websettings.set.allowFileAccess",
            before: ` 
                let data : Record<string, any> = {};
                data['arg0_allow'] = arguments[0];
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    data
                )
            `
        },
        {
            name: "webSettings setAllowFileAccessFromFileURLs",
            descr: "set Allow File Access from file URLs",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^android.webkit.WebSettings$/").filter("name:setAllowFileAccessFromFileURLs")'
            },
            autoEmit: true,
            emitEvent: "hook.webviews.websettings.set.allowFileAccessFromFileURLs",
            before: ` 
                let data : Record<string, any> = {};
                data['arg0_flag'] = arguments[0];
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    data
                )
            `
        },
        {
            name: "webSettings setAllowUniversalAccessFromFileURLs",
            descr: "set Allow Universal File Access from file URLs",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^android.webkit.WebSettings$/").filter("name:setAllowUniversalAccessFromFileURLs")'
            },
            autoEmit: true,
            emitEvent: "hook.webviews.websettings.set.allowUniversalAccessFromFileURLs",
            before: ` 
                let data : Record<string, any> = {};
                data['arg0_flag'] = arguments[0];
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    data
                )
            `
        },
        {
            name: "webSettings setJavaScriptEnabled",
            descr: "JavaScript enabled",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^android.webkit.WebSettings$/").filter("name:setJavaScriptEnabled")'
            },
            autoEmit: true,
            emitEvent: "hook.webview.websettings.js.JavaScriptEnabled",
            before: ` 
                let data : Record<string, any> = {};
                data['arg0_flag'] = arguments[0];
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    data
                )
            `
        },
        {
            name: "WebView setVisibility",
            descr: "Hooks the set on the visibility of WebView",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^android.webkit.WebView$/").filter("name:setVisibility")'
            },
            autoEmit: true,
            emitEvent: "hook.webview.set.Visibility",
            before: ` 
            let data : Record<string, any> = {};
            let newValue = '';
            switch (arguments[0]) {
                case 0:
                    newValue = 'VISIBLE';
                    break;
                case 1:
                    newValue = 'INVISIBLE';
                    break;
                case 2:
                    newValue = 'GONE';
                    break;
                case 4:
                    newValue = 'INVISIBLE';
                    break;
                case 8:
                    newValue = 'GONE';
                    break;
            }
            data['arg0_visibility'] = arguments[0];
            data['visibility'] = newValue;
            if (data) {
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    data
                )
            }
        `
        },
        {
            name: "WebView addJavascriptInterface",
            descr: "Hook the injection of Java object into a WebView. ",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^android.webkit.WebView$/").filter("name:addJavascriptInterface")'
            },
            autoEmit: true,
            emitEvent: "hook.webview.js.addInterface",
            before: ` 
                let data : Record<string, any> = {};
                data['arg0_object_Class'] = arguments[0].getClass();
                data['arg1_objectName'] = arguments[1];
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    data
                )
            `
        },
        {
            name: "WebView evaluateJavascript",
            descr: "Hook the evaluation of JavaScript.",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^android.webkit.WebView$/").filter("name:evaluateJavascript")'
            },
            autoEmit: true,
            emitEvent: "hook.webview.js.evaluate",
            before: ` 
                let data : Record<string, any> = {};
                data['arg0_script'] = arguments[0];
                //TODO: check if this is ok
                data['webViewClient'] = this.getWebViewClient();
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    data
                )
            `
        },
        {
            name: "WebView getOriginalUrl",
            descr: "Get original Url",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^android.webkit.WebView$/").filter("name:getOriginalUrl")'
            },
            autoEmit: true,
            emitEvent: "hook.webview.getOriginalUrl",
            before: ` 
                let data : Record<string, any> = {};
                data['originalUrl'] = this.getOriginalUrl();
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    data
                )
            `
        },
        {
            name: "WebView getUrl",
            descr: "Get Url",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^android.webkit.WebView$/").filter("name:getUrl")'
            },
            autoEmit: true,
            emitEvent: "hook.webview.getUrl",
            before: ` 
                let data : Record<string, any> = {};
                data['originalUrl'] = this.getUrl();
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    data
                )
            `
        }
       ]
    },
    
    eventListeners: {
    }
});


export default WebViewInspector;