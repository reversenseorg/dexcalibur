ace.define("ace/mode/smali_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var SmaliHighlightRules = function() {

    var keywords = (
        "select|insert|update|delete|from|where|and|or|group|by|order|limit|offset|having|as|case|" +
        "when|else|end|type|left|right|join|on|outer|desc|asc|union|create|table|primary|key|if|" +
        "foreign|not|references|default|null|inner|cross|natural|database|drop|grant"
    );

    var builtinConstants = (
        "true|false"
    );

    var builtinFunctions = (
        "avg|count|first|last|max|min|sum|ucase|lcase|mid|len|round|rank|now|format|" + 
        "coalesce|ifnull|isnull|nvl"
    );

    var dataTypes = (
        "int|numeric|decimal|date|varchar|char|bigint|float|double|bit|binary|text|set|timestamp|" +
        "money|real|number|integer"
    );

    var keywordMapper = this.createKeywordMapper({
        "support.function": builtinFunctions,
        "keyword": keywords,
        "constant.language": builtinConstants,
        "storage.type": dataTypes
    }, "identifier", true);

    this.$rules = {
        "start" : [ {
            token : "comment",
            regex : "--.*$"
        },  {
            token : "comment",
            start : "/\\*",
            end : "\\*/"
        },  {
            token : "comment",
            start : "\\{",
            end : "\\}",
        },{
            token : "keyword",           // " string
            regex : 'if-[a-z]+'
        }, {
            token : "constant.language",           // " string
            regex : 'const-[a-z0-9]+'
        }, {
            token : "support.function",           // " string
            regex : 'invoke-[a-z0-9]+'
        }, {
            token : "support.class",           // " string
            regex : '(L[^\s\t;]+;)|(new-instance)',//[^\(:]+'
        }, {
            token : "storage.type",           // " string
            regex : ':[BISZVJL][^\n]*'
        }/*, {
            token : "support.type",           // " string
            regex : 'L[^\s\t;]+;[^->)]'
        }*/, {
            token : "punctuation.tag",           // " string
            regex : ':cond_[a-z0-9]+$'
        }, {
            token : "punctuation.tag",           // " string
            regex : '\\.cond_[a-z0-9]+$'
        }, {
            token : "punctuation.goto",           // " string
            regex : '\\.goto_[a-z0-9]+$'
        }, {
            token : "punctuation.goto",           // " string
            regex : ':goto_[a-z0-9]+$'
        }, {
            token : "string",           // " string
            regex : '".*?"'
        }, {
            token : "string",           // ' string
            regex : "'.*?'"
        }, {
            token : "string",           // ` string (apache drill)
            regex : "`.*?`"
        }, {
            token : "constant.numeric", // float
            regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
        }, {
            token : keywordMapper,
            regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
        }, {
            token : "keyword.operator",
            regex : "\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|="
        }, {
            token : "paren.lparen",
            regex : "[\\(]"
        }, {
            token : "paren.rparen",
            regex : "[\\)]"
        }, {
            token : "text",
            regex : "\\s+"
        },],
        "param": [{
            token : "params",
            regex : "\\s*p[0-9a-f]+,?"
        }]
    };
    this.normalizeRules();
};

oop.inherits(SmaliHighlightRules, TextHighlightRules);

exports.SmaliHighlightRules = SmaliHighlightRules;
});

ace.define("ace/mode/smali",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/smali_highlight_rules"], function(require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextMode = require("./text").Mode;
    var SmaliHighlightRules = require("./smali_highlight_rules").SmaliHighlightRules;

    var Mode = function() {
        this.HighlightRules = SmaliHighlightRules;
        this.$behaviour = this.$defaultBehaviour;
    };
    oop.inherits(Mode, TextMode);

    (function() {

        this.lineCommentStart = "--";

        this.$id = "ace/mode/smali";
    }).call(Mode.prototype);

    exports.Mode = Mode;

});
                (function() {
                    ace.require(["ace/mode/smali"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            