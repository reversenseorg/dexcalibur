



const PUBLIC_FLAG = 0b1;
const PROTECTED_FLAG = 0b10;
const STATIC_FLAG = 0b10<<1;
const ABSTRACT_FLAG = 0b10<<2;
const CONSTRUCT_FLAG = 0b10<<3;
const FINAL_FLAG = 0b10<<4;
const TRANS_FLAG = 0b10<<5;
const NATIVE_FLAG = 0b10<<6;
const INTERFACE_FLAG = 0b10<<7;
const STRICTFP_FLAG = 0b10<<8;
const BRIDGE_FLAG = 0b10<<9;
const VARARGS_FLAG = 0b10<<10;
const DECLSYNC_FLAG = 0b10<<11;
const ENUM_FLAG = 0b10<<12;
const SYNTH_FLAG = 0b10<<13;
const VOLATILE_FLAG = 0b10<<14;
const SYNC_FLAG = 0b10<<15;
const PRIVATE_FLAG = 0b10<<16;


/**
 * Represents the access flags of a Class/Method/Field
 * 
 * @class
 */
class AccessFlags
{
    /**
     * 
     * @param {*} pVisibility 
     * @constructor
     */
    constructor(pVisibility=PUBLIC_FLAG){
        this.visibility = pVisibility; 
        this._match = 0;
    }

    set public(pParam){
        this.visibility |= PUBLIC_FLAG;

        if(this.visibility & PRIVATE_FLAG)
            this.visibility ^= PRIVATE_FLAG;
        
        if(this.visibility & PROTECTED_FLAG)
            this.visibility ^= PROTECTED_FLAG;
    }

    get public(){
        return (this.visibility & PUBLIC_FLAG)>0;
    }

    set private(pParam){
        this.visibility |= PRIVATE_FLAG;

        if(this.visibility & PUBLIC_FLAG)
            this.visibility ^= PUBLIC_FLAG;
        
        if(this.visibility & PROTECTED_FLAG)
            this.visibility ^= PROTECTED_FLAG;
    }

    get private(){
        return (this.visibility & PRIVATE_FLAG)>0;
    }

    set static(pParam){
        this.visibility |= STATIC_FLAG;
    }

    get static(){
        return (this.visibility & STATIC_FLAG)>0;
    }
    
    set protected(pParam){
        this.visibility |= PROTECTED_FLAG;

        if(this.visibility & PRIVATE_FLAG)
            this.visibility ^= PRIVATE_FLAG;
        
        if(this.visibility & PUBLIC_FLAG)
            this.visibility ^= PUBLIC_FLAG;
    }

    get protected(){
        return (this.visibility & PROTECTED_FLAG)>0;
    }


    set final(pParam){
        this.visibility |= FINAL_FLAG;
    }

    get final(){
        return (this.visibility & FINAL_FLAG)>0;
    }


    set construct(pParam){
        this.visibility |= CONSTRUCT_FLAG;
    }

    get construct(){
        return (this.visibility & CONSTRUCT_FLAG)>0;
    }


    set varargs(pParam){
        this.visibility |= VARARGS_FLAG;
    }

    get varargs(){
        return (this.visibility & VARARGS_FLAG)>0;
    }


    set bridge(pParam){
        this.visibility |= BRIDGE_FLAG;
    }

    get bridge(){
        return (this.visibility & BRIDGE_FLAG)>0;
    }


    set native(pParam){
        this.visibility |= NATIVE_FLAG;
    }

    get native(){
        return (this.visibility & NATIVE_FLAG)>0;
    }


    set abstract(pParam){
        this.visibility |= ABSTRACT_FLAG;
    }

    get abstract(){
        return (this.visibility & ABSTRACT_FLAG)>0;
    }


    set interface(pParam){
        this.visibility |= INTERFACE_FLAG;
    }

    get interface(){
        return (this.visibility & INTERFACE_FLAG)>0;
    }


    set strictfp(pParam){
        this.visibility |= STRICTFP_FLAG;
    }

    get strictfp(){
        return (this.visibility & STRICTFP_FLAG)>0;
    }


    set transient(pParam){
        this.visibility |= TRANS_FLAG;
    }

    get transient(){
        return (this.visibility & TRANS_FLAG)>0;
    }


    set declsync(pParam){
        this.visibility |= DECLSYNC_FLAG;
    }

    get declsync(){
        return (this.visibility & DECLSYNC_FLAG)>0;
    }


    set enum(pParam){
        this.visibility |= ENUM_FLAG;
    }

    get enum(){
        return (this.visibility & ENUM_FLAG)>0;
    }

    set volatile(pParam){
        this.visibility |= VOLATILE_FLAG;
    }

    get volatile(){
        return (this.visibility & VOLATILE_FLAG)>0;
    }


    set synchronized(pParam){
        this.visibility |= SYNC_FLAG;
    }

    get synchronized(){
        return (this.visibility & SYNC_FLAG)>0;
    }


    set synthetic(pParam){
        this.visibility |= SYNTH_FLAG;
    }

    get synthetic(){
        return (this.visibility & SYNTH_FLAG)>0;
    }
    

    toJsonObject(include=null){
        let o = new Object();
        o.visibility = this.visibility;
    
        
        if(this.public) o.public = true;
        if(this.protected) o.protected = true;
        if(this.private) o.private = true;
        if(this.native) o.native = true;
        if(this.transient) o.transient = true;
        if(this.native) o.native = true;
        if(this.strictfp) o.strictfp = true;
        if(this.declsync) o.declsync = true;
        if(this.construct) o.construct = true;
        if(this.enum) o.enum = true;
        if(this.interface) o.interface = true;
        if(this.abstract) o.abstract = true;
        if(this.static) o.static = true;
        if(this.final) o.final = true;
        if(this.synthetic) o.synthetic = true;
        if(this.synchronized) o.synchronized = true;
        if(this.volatile) o.volatile = true;
        

        return o;
    };

   
    sprint(){
        let dbg="["

        if(this.public) dbg += "public,";
        if(this.protected) dbg += "protected,";
        if(this.private) dbg += "private,";
        if(this.native) dbg += "native,";
        if(this.transient) dbg += "transient,";
        if(this.native) dbg += "native,";
        if(this.strictfp) dbg += "strictfp,";
        if(this.declsync) dbg += "declsync,";
        if(this.construct) dbg += "construct,";
        if(this.enum) dbg += "enum,";
        if(this.interface) dbg += "interface,";
        if(this.abstract) dbg += "abstract,";
        if(this.static) dbg += "static,";
        if(this.final) dbg += "final,";
        if(this.synchronized) dbg += "synchronized,";
        if(this.synthetic) dbg += "synthetic,";
        if(this.volatile) dbg += "volatile,";
        
        return dbg+"]";
    }
}


module.exports = {
    PUBLIC: PUBLIC_FLAG,
    PRIVATE: PRIVATE_FLAG,
    PROTECTED: PROTECTED_FLAG,
    AccessFlags: AccessFlags,
}