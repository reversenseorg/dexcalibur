import AnalyzerDatabase from "../AnalyzerDatabase.js";
import ModelPackage from "../ModelPackage.js";
import ModelClass from "../ModelClass.js";
import ModelMethod from "../ModelMethod.js";
import ModelField from "../ModelField.js";
import ModelSyscall from "../ModelSyscall.js";
import AndroidActivity from "../android/AndroidActivity.js";
import AndroidProvider from "../android/AndroidProvider.js";
import AndroidReceiver from "../android/AndroidReceiver.js";
import AndroidService from "../android/AndroidService.js";
import {ModelPermission} from "../android/ModelPermission.js";
import {ModelFunction} from "../ModelFunction.js";
import ModelFile from "../ModelFile.js";
import {Nullable} from "@dexcalibur/dxc-core-api";


export interface ISearchAPISelector<T>
{
    _db:Nullable<T>;

    package(id:string):ModelPackage;

    class(id:string):ModelClass;

    method(id:string):ModelMethod;

    field(id:string):ModelField;

    syscalls(id:string):ModelSyscall;

    activity(id:string):AndroidActivity;

    provider(id:string):AndroidProvider;

    receiver(id:string):AndroidReceiver;

    service(id:string):AndroidService;

    permission(id:string):ModelPermission;

    func(id:string):ModelFunction;

    files(id:string):ModelFile;

    session(id:string):ModelFile;

    event(id:string):ModelFile;
}
