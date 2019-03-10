const UT = require("./Utils.js");

const TRANSPORT = {
    USB: 'U',
    WIFI: 'W'
};






/**
 * Create a new instance of ADB for a specific device
 * 
 * The default transport type is the USB.
 * 
 * @param {*} adbpath The path of ADB 
 * @param {*} deviceid The subject device ID
 */
function AdbWrapper(adbpath,deviceid){
    this.transport = TRANSPORT.USB;
    this.path = adbpath;
    this.deviceID = deviceid;
}

AdbWrapper.prototype.buildCommand = function(){
    return this.path+" -"+this.transport+' -s '+this.deviceID+' ';
}

/**
 * To return the list of connected devices
 */
AdbWrapper.prototype.listDevices = function(){
    var out = UT.execSync(this.path+" devices -l");    
    return out;
}


/**
 * Set the transport type
 */
AdbWrapper.prototype.setTransport = function(transport_type){
    this.transport = transport_type;
}

/**
 * Pull a remote resource into the project workspace
 * Same as 'adb pull' commande.
 * 
 * @param {*} remote_path The path of the remote resource to download 
 * @param {*} local_path The path where the resource will be stored locally
 */
AdbWrapper.prototype.pull = function(remote_path, local_path){
    return UT.execSync(this.buildCommand+'pull '+remote_path+' '+local_path);
}


/**
 * Pull a remote resource with restricted access
 * Same as "adb shell su -c 'cp remote_path /sdcard/B'; adb pull /sdcard/B local_path; adb shell rm -r /sdcard/B"  commande.
 * 
 * @param {*} remote_path The path of the remote resource to download 
 * @param {*} local_path The path where the resource will be stored locally
 */
/*
AdbWrapper.prototype.pullSu = function(remote_path, local_path){
    var ret = UT.execSync(this.buildCommand+'su -c "cp '+remote_path+' /sdcard/'+UT.time()+'"');
    
    return ret;
}
*/


/**
 * Push a local resource to a remote location
 * Same as 'adb push' commande.
 * 
 * @param {*} local_path The path of the local resource to upload 
 * @param {*} remote_path The path where the resource will be stored remotely
 */
AdbWrapper.prototype.push = function(local_path, remote_path){
    return UT.execSync(this.buildCommand+'push '+local_path+' '+remote_path);
}


/**
 * Execute a command on the device
 * Same as 'adb shell' commande.
 * 
 * @param {*} command The command to execute remotely
 */
AdbWrapper.prototype.shell = function(command){
    return UT.execSync(this.buildCommand+'shell '+command);
}


/**
 * Execute a command on the device via 'su -c'
 * Same as 'adb shell su -c' commande.
 * 
 * @param {*} command The command to execute remotely
 */
AdbWrapper.prototype.shellSu = function(command){
    return UT.execSync(this.buildCommand+'shell su -c '+command);
}


/**
 * Execute a command on the device via 'su -c'
 * Same as 'adb forward' command.
 * 
 * @param {*} command The command to execute remotely
 */
AdbWrapper.prototype.forward = function(local,remote){
    return UT.execSync(this.buildCommand+'forward '+local+' '+remote);
}

/**
 * Execute a command on the device via 'su -c'
 * Same as 'adb version' command.
 * 
 */
AdbWrapper.prototype.version = function(){
    return UT.execSync(this.buildCommand+'version');
}

/**
 * To reboot the device
 * Same as 'adb reboot' command.
 * 
 */
AdbWrapper.prototype.reboot = function(){
    return UT.execSync(this.buildCommand+'version');
}


/**
 * To reboot the device
 * Same as 'adb reboot' command.
 * 
 */
AdbWrapper.prototype.reconnectHost = function(){
    return UT.execSync(this.buildCommand+'reconnect');
}


/**
 * To reboot the device
 * Same as 'adb reboot' command.
 * 
 */
AdbWrapper.prototype.reconnectDevice = function(){
    return UT.execSync(this.buildCommand+'reconnect device');
}


module.exports = AdbWrapper;