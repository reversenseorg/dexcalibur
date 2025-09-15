
import {ABI, AbiManager, InstructionSet} from "../../binary/ABI.js";
import {AbiException} from "../../errors/AbiException.js";
import {OperatingSystem} from "@dexcalibur/dxc-core-api";
import {Architecture} from "../../Architecture.js";
import { GenericSystemProfile } from "../../device/profile/GenericSystemProfile.js";
import {NosyProfile} from "../../device/profile/NosyProfile.js";
import {DeviceProfilingOptions, IBridge} from "../../Bridge.js";
import * as Log from "../../Logger.js";
import {IProfile} from "../../device/profile/IProfile.js";
import {IomemLayoutParser} from "../../linux/parser/IomemLayoutParser.js";
import {MemoryLayout} from "../../memory/MemoryLayout.js";
import {Nullable} from "../../core/IStringIndex.js";
import {GenericMemoryProfile} from "../../device/profile/GenericMemoryProfile.js";
import {SerializeOptions} from "@dexcalibur/dexcalibur-orm";


const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export default class AndroidMemoryProfile extends GenericMemoryProfile implements NosyProfile{

    uid = "Android_Memory";

    requireRoot = true;

    nosy = true;

    is(pData:any):boolean{
        return false;
    }

    async performProfiling(pBridge: IBridge, pOptions?: DeviceProfilingOptions): Promise<IProfile> {

        let success:IProfile;
        try{
            const iomem:string = (await pBridge.privilegedShell("cat /proc/iomem")).toString();
            const parser = new IomemLayoutParser();

            if(iomem!=null){
                this.phyLayout = parser.parse(Buffer.from(iomem));
                //pOptions.profile.addProperty('mem_layout', this.phyLayout);
            }

            success = this;
        }catch(err){
            Logger.error(err.message);
            Logger.error(err.stack);
            success = null;
        }

        return success;
    }


    /**
     * To get device architecture
     * @method
     */
    getLayout(pUpdate=false):Nullable<MemoryLayout>{
        return this.phyLayout;
    }

    /**
     *
     * @param {*} pJson
     * @static
     */
    static fromJsonObject( pJson:any):AndroidMemoryProfile{
        const o:AndroidMemoryProfile = new AndroidMemoryProfile();

        for(const i in pJson)
            o[i] = pJson[i];

        if(o.phyLayout!=null){

            o.phyLayout = MemoryLayout.fromJsonObject(o.phyLayout)
        }
        return o;
    }

    toJsonObject(pOptions: SerializeOptions = {exclude: {}}): any {
        let o = super.toJsonObject({exclude:{phyLayout:true}});
        if(this.phyLayout!=null){
            o.phyLayout = this.phyLayout.toJsonObject();
        }
        return o;
    }
}