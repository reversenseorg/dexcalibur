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
