ace.define("ace/theme/monokai2",["require","exports","module","ace/lib/dom"], function(require, exports, module) {

exports.isDark = true;
exports.cssClass = "ace-monokai2";
exports.cssText = ".ace-monokai2 .ace_gutter {\
background: #2F3129;\
color: #8F908A\
}\
.ace-monokai2 .ace_print-margin {\
width: 1px;\
background: #555651\
}\
.ace-monokai2 {\
background-color: #272822;\
color: #F8F8F2\
}\
.ace-monokai2 .ace_cursor {\
color: #F8F8F0\
}\
.ace-monokai2 .ace_marker-layer .ace_selection {\
background: #49483E\
}\
.ace-monokai2.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #272822;\
}\
.ace-monokai2 .ace_marker-layer .ace_step {\
background: rgb(102, 82, 0)\
}\
.ace-monokai2 .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid #49483E\
}\
.ace-monokai2 .ace_marker-layer .ace_active-line {\
background: #202020\
}\
.ace-monokai2 .ace_gutter-active-line {\
background-color: #272727\
}\
.ace-monokai2 .ace_marker-layer .ace_selected-word {\
border: 1px solid #49483E\
}\
.ace-monokai2 .ace_invisible {\
color: #52524d\
}\
.ace-monokai2 .ace_entity.ace_name.ace_tag,\
.ace-monokai2 .ace_keyword,\
.ace-monokai2 .ace_meta.ace_tag,\
.ace-monokai2 .ace_storage {\
color: #F92672\
}\
.ace-monokai2 .ace_punctuation,\
.ace-monokai2 .ace_punctuation.ace_goto {\
background-color: #FF0;\
color:#000\
}\
.ace-monokai2 .ace_punctuation.ace_tag {\
background-color: #0F0;\
color:#000\
}\
.ace-monokai2 .ace_constant.ace_character,\
.ace-monokai2 .ace_constant.ace_language,\
.ace-monokai2 .ace_constant.ace_numeric,\
.ace-monokai2 .ace_constant.ace_other {\
color: #AE81FF\
}\
.ace-monokai2 .ace_invalid {\
color: #F8F8F0;\
background-color: #F92672\
}\
.ace-monokai2 .ace_invalid.ace_deprecated {\
color: #F8F8F0;\
background-color: #AE81FF\
}\
.ace-monokai2 .ace_support.ace_constant {\
color: #66D9EF\
} \
.ace-monokai2 .ace_support.ace_function {\
color: #66D9EF\
}\
.ace-monokai2 .ace_fold {\
background-color: #A6E22E;\
border-color: #F8F8F2\
}\
.ace-monokai2 .ace_storage.ace_type {\
color:#FF0;\
font-weight:bold\
}\
.ace-monokai2 .ace_support.ace_class {\
color:#F00;\
font-weight:bold\
}\
.ace-monokai2 .ace_support.ace_type {\
font-style: italic;\
color: #c06;\
}\
.ace-monokai2 .ace_entity.ace_name.ace_function,\
.ace-monokai2 .ace_entity.ace_other,\
.ace-monokai2 .ace_entity.ace_other.ace_attribute-name,\
.ace-monokai2 .ace_variable {\
color: #A6E22E\
}\
.ace-monokai2 .ace_variable.ace_parameter {\
font-style: italic;\
color: #FD971F\
}\
.ace-monokai2 .ace_string {\
color: #E6DB74\
}\
.ace-monokai2 .ace_params {\
color: #FFF\
background-color: #F00\
}\
.ace-monokai2 .ace_comment {\
color: #75715E\
}\
.ace-monokai2 .ace_indent-guide {\
background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWPQ0FD0ZXBzd/wPAAjVAoxeSgNeAAAAAElFTkSuQmCC) right repeat-y\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
                (function() {
                    ace.require(["ace/theme/monokai2"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            