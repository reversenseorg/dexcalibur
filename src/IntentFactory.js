
const OPTIONS = {
    Intent: [
        ['-a','action','Specify the intent action, such as android.intent.action.VIEW. You can declare this only once. '],
        ['-d','data_uri','Specify the intent data URI, such as content://contacts/people/1. You can declare this only once. '],
        ['-t','mime_type','Specify the intent MIME type, such as image/png. You can declare this only once. '],
        ['-c','category','Specify an intent category, such as android.intent.category.APP_CONTACTS. '],
        ['-n','component','Specify the component name with package name prefix to create an explicit intent, such as com.example.app/.ExampleActivity. '],
        ['-f','flags','Add flags to the intent, as supported by setFlags(). '],
        ['--esn','extra_key','Add a null extra. This option is not supported for URI intents. '],
        ['--es','extra_key extra_string_value','Add string data as a key-value pair. '],
        ['--ez','extra_key extra_boolean_value','Add boolean data as a key-value pair. '],
        ['--ei','extra_key extra_int_value','Add integer data as a key-value pair. '],
        ['--el','extra_key extra_long_value','Add long data as a key-value pair. '],
        ['--ef','extra_key extra_float_value','Add float data as a key-value pair. '],
        ['--eu','extra_key extra_uri_value','Add URI data as a key-value pair. '],
        ['--ecn','extra_key extra_component_name_value','Add a component name, which is converted and passed as a ComponentName object. '],
        ['--eia','extra_key extra_int_value[,extra_int_value...]','Add an array of integers. '],
        ['--ela','extra_key extra_long_value[,extra_long_value...]','Add an array of longs. '],
        ['--efa','extra_key extra_float_value[,extra_float_value...]','Add an array of floats. '],
        // passed a extra opts
        ['--grant-read-uri-permission','','Include the flag FLAG_GRANT_READ_URI_PERMISSION. '],
        ['--grant-write-uri-permission','','Include the flag FLAG_GRANT_WRITE_URI_PERMISSION. '],
        ['--debug-log-resolution','','Include the flag FLAG_DEBUG_LOG_RESOLUTION. '],
        ['--exclude-stopped-packages','','Include the flag FLAG_EXCLUDE_STOPPED_PACKAGES. '],
        ['--include-stopped-packages','','Include the flag FLAG_INCLUDE_STOPPED_PACKAGES. '],
        ['--activity-brought-to-front','','Include the flag FLAG_ACTIVITY_BROUGHT_TO_FRONT. '],
        ['--activity-clear-top','','Include the flag FLAG_ACTIVITY_CLEAR_TOP. '],
        ['--activity-clear-when-task-reset','','Include the flag FLAG_ACTIVITY_CLEAR_WHEN_TASK_RESET. '],
        ['--activity-exclude-from-recents','','Include the flag FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS. '],
        ['--activity-launched-from-history','','Include the flag FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY. '],
        ['--activity-multiple-task','','Include the flag FLAG_ACTIVITY_MULTIPLE_TASK. '],
        ['--activity-no-animation','','Include the flag FLAG_ACTIVITY_NO_ANIMATION. '],
        ['--activity-no-history','','Include the flag FLAG_ACTIVITY_NO_HISTORY. '],
        ['--activity-no-user-action','','Include the flag FLAG_ACTIVITY_NO_USER_ACTION. '],
        ['--activity-previous-is-top','','Include the flag FLAG_ACTIVITY_PREVIOUS_IS_TOP. '],
        ['--activity-reorder-to-front','','Include the flag FLAG_ACTIVITY_REORDER_TO_FRONT. '],
        ['--activity-reset-task-if-needed','','Include the flag FLAG_ACTIVITY_RESET_TASK_IF_NEEDED. '],
        ['--activity-single-top','','Include the flag FLAG_ACTIVITY_SINGLE_TOP. '],
        ['--activity-clear-task','','Include the flag FLAG_ACTIVITY_CLEAR_TASK. '],
        ['--activity-task-on-home','','Include the flag FLAG_ACTIVITY_TASK_ON_HOME. '],
        ['--receiver-registered-only','','Include the flag FLAG_RECEIVER_REGISTERED_ONLY. '],
        ['--receiver-replace-pending','','Include the flag FLAG_RECEIVER_REPLACE_PENDING. '],
        ['--selector','','Requires the use of -d and -t options to set the intent data and type. ']
    ]
};

class Intent
{
    static OPTIONS = OPTIONS.Intent;

    constructor(pOptions = null){
        this.action = null;
        this.data_uri = null;
        this.mime_type = null;
        this.category = null;
        this.flags = null;
        this.extra_keys = null;
        this.extra_opts = null;

        if(pOptions!=null)
            this.setOptions(pOptions);
    }

    setExtraKeys(pExtraKeys){
        console.log("[DEV :: Intent] TODO : Extra keys  are not yet handled");
        return;
    }

    setOptions(pOptions){
        // generic init
        for(let i in pOptions){
            if(this[i] !== undefined)
                this[i] = pOptions[i];
        }

        // extra keys init
        if(this.extra_keys != null){
            this.setExtraKeys(this.extra_keys);
        }

    }

    static getOptions(){
        return Intent.OPTIONS;
    }

    buildCommand(){
        let str = '';

        console.log(this);

        // only once is authorized
        if(this.action !== null && this.action.length > 0) str+= ` -a ${this.action} `;  
        if(this.data_uri !== null && this.data_uri.length > 0) str+= ` -d ${this.data_uri} `; 
        if(this.mime_type !== null && this.mime_type.length > 0) str+= ` -t ${this.mime_type} `;

        
        // several category is supported by android
        if(this.category !== null){
            if(typeof this.category == "array"){
                this.category.map((x)=>{ str+= ` -c ${x} `;  });
            }else if(this.category.length >0){
                str+= ` -c ${this.category} `; 
            }
        }
         
        if(this.flags !== null && this.flags.length >0) str+= ` -f ${this.flags} `;

        if(this.extra_keys !==null){
          // this.category.map((x)=>{ str+=;  });
        }
        
        if(this.extra_opts !== null && this.extra_opts.length > 0) str+= ' '+this.extra_opts;

        return str;
    }
}



class IntentCommandFactory
{
    static BINARY = 'am';

    static listTypes(){
        return [
            'start_activity',
            'start_service',
            'broadcast'
        ];
    }

    constructor(type, pApplication=null, extra_opts=null){
        this.requester = null;
        this.extra_opts = extra_opts;
        this.app = pApplication;

        switch(type){
            case 'start_activity':
                this.requester = this.startActivityIntent;
                break;
            case 'broadcast':
                this.requester =  this.broadcastIntent;
                break;
            case 'start_service':
                this.requester = this.startServiceIntent;
                break;
            default:
                throw new Error("[INTENT FACTORY] Type unknow");
        }
    }

    startServiceIntent(pIntent, extra_opts=null){
        return `${IntentCommandFactory.BINARY} startservice ${pIntent.buildCommand()} ${this.app}`;
    }

    startActivityIntent(pIntent, extra_opts=null){
        return `${IntentCommandFactory.BINARY} start ${pIntent.buildCommand()} ${this.app}`;
    }

    broadcastIntent(pIntent, extra_opts=null){
        return `${IntentCommandFactory.BINARY} broadcast ${pIntent.buildCommand()} ${this.app}`;
    }

    getIntentCommand(pIntent){
        return this.requester(pIntent, this.extra_opts);
    }
}


module.exports = {
    IntentCommandFactory: IntentCommandFactory,
    Intent: Intent
};