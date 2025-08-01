/**
 *
 * @class
 */
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
import {ISearchAPISelector} from "./ISearchApiSelector.js";


export class SearchAPISelector implements ISearchAPISelector<AnalyzerDatabase>
{
  _db:AnalyzerDatabase = null;

  constructor(pDb:AnalyzerDatabase) {
    this._db = pDb;
  }

  package(id:string):ModelPackage{
    return this._db.packages.getEntry(id)
  }

  class(id:string):ModelClass{
    return this._db.classes.getEntry(id)
  }

  method(id:string):ModelMethod{
    return this._db.methods.getEntry(id)
  }

  field(id:string):ModelField{
    return this._db.fields.getEntry(id)
  }

  syscalls(id:string):ModelSyscall{
    return this._db.syscalls.getEntry(id)
  }

  activity(id:string):AndroidActivity{
    return this._db.activities.getEntry(id)
  }

  provider(id:string):AndroidProvider{
    return this._db.providers.getEntry(id)
  }

  receiver(id:string):AndroidReceiver{
    return this._db.receivers.getEntry(id)
  }

  service(id:string):AndroidService{
    return this._db.services.getEntry(id)
  }

  permission(id:string):ModelPermission{
    return this._db.permissions.getEntry(id)
  }

  func(id:string):ModelFunction{
    return this._db.funcs.getEntry(id);
  }

  files(id:string):ModelFile{
    return this._db.files.getEntry(id);
  }

  session(id:string):ModelFile{
    return this._db.files.getEntry(id);
  }

  event(id:string):ModelFile{
    return this._db.files.getEntry(id);
  }
}
