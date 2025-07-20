import * as _path_ from "path";
//import * as _sudo_ from "sudo-prompt";
import * as _fs_ from "fs";
import * as _ps_ from "child_process";
import Util from "../../Utils.js";


export class ExecutorException extends Error {
  public _error: any;
  public _out?: string;
  public _err?: string;
  public _sudo: boolean = false;


  constructor(err: any, sudo:boolean, stdout?: string, stderr?: string, ) {
    super(
      `Error occurred in spawn.\n` +
      `  err: ${err}\n` +
      `  stdout: ${stdout}\n` +
      `  stderr: ${stderr}\n`+
      `  sudo: ${sudo}\n`
    );

    this._error = err;
    this._out = stdout;
    this._err = stderr;
    this._sudo = sudo;
  }
}


export enum ExecutorIO {
  IN,
  OUT,
  ERR
}

export class Executor {

  name:string;

  icon = "";

  /**
   * Temporary folder
   */
  private _tmp:string = null;

  public _error: any;

  private _sudo:boolean = false;
  private _out:string = null;
  private _err:string = null;
  private _log:Function = (()=>{});

  private __fail:Function = null;
  private _opts:any = {};

  success:boolean = false;

  constructor(pName:string, pConfig:any=null) {
    this.name = pName;
    if(pConfig!=null){
      for(let i in pConfig) this[i]=pConfig[i];
    }
  }

  setTempFolder(pPath:string){
    this._tmp = pPath;
  }

  isSudo():boolean {
    return this._sudo;
  }

  turnSudo(pEnable:boolean):void{
    this._sudo = pEnable;
  }

  /**
   *
   * @param pStdio
   */
  log(pStdio:ExecutorIO | number):void {
    if(this._tmp==null){
      throw new Error("Temporary folder not defined");
    }

    if((pStdio & ExecutorIO.OUT)==ExecutorIO.OUT){
      this._out = _path_.join(this._tmp,'install-'+this.name+'-out.log');
    }
    if((pStdio & ExecutorIO.ERR)==ExecutorIO.ERR){
      this._err = _path_.join(this._tmp,'install-'+this.name+'-err.log');
    }
  }

  setExternalLogger(pLogFn:Function):void {
    this._log = pLogFn;
  }

  prepareIO():number[]  {
    return [
        null,
        (this._out!==null ? _fs_.openSync(this._out, 'w+') : null ),
        (this._err!==null ? _fs_.openSync(this._err, 'w+') : null ),
    ];
  }

  clearIO(pFileDescriptors:number[]):void {
    pFileDescriptors.map( vFD => {
      if(vFD!=null) _fs_.closeSync(vFD);
    })
  }

  execSync(pCommand:string):any {
    if(this._sudo){
      throw new Error("Sudo commands cannot be executed synchronously.");
    }else{
      const opts = {stdio: this.prepareIO() };
      _ps_.execSync(pCommand, opts);

      if(opts.stdio[1]!==null){
        this._log("EXECUTE '"+pCommand+"' :\n STD OUT \n ");
        this._log(_fs_.readFileSync(this._out));
      }

      if(opts.stdio[2]!==null){
        this._log("EXECUTE '"+pCommand+"' :\n STD ERR \n ");
        this._log(_fs_.readFileSync(this._err));
      }

      this.clearIO(opts.stdio);
    }
  }

  getIO(pStdio:ExecutorIO): Buffer {
    if(pStdio===1)
      return _fs_.readFileSync(this._out);
    if(pStdio===2)
      return _fs_.readFileSync(this._err);
    else
      return null;
  }

  /**
   * To define a function detecting if execution failed or not
   *
   * The aim of this function is to customize the way to process
   * stderr output in order to detect true fail instead of warning message
   *
   *
   * @param pFailTest
   */
  setFailTest(pFailTest:Function):Executor{
    this.__fail = pFailTest;
    return this;
  }

  /**
   *
   * @param pStdErr
   */
  didExecFail( pStdErr:string):boolean {
    if(this.__fail==null){
      return (pStdErr !== undefined
        && !Util.isEmpty(pStdErr, Util.FLAG_WS | Util.FLAG_CR));
    }else{
      return this.__fail(pStdErr);
    }
  }

  /**
   *
   * @param pName
   * @param pValue
   */
  addOption(pName:string, pValue:any):void {
    this._opts[pName] = pValue;
  }

  async execAsync(pCommands: string):Promise<Executor> {
      return new Promise<Executor>((resolve, reject) => {

        const cwd = process.cwd();
        if(this._opts.hasOwnProperty('cwd')){
          process.chdir(this._opts.cwd);
        }

        (this._sudo? /*_sudo_.exec*/(a:any,b:any,c:any)=>{
          console.error("Sudo is not more supported. Contact support.");
          process.exit(1);
        }  : _ps_.exec)(
          pCommands,
            {
              name: 'Dexcalibur Installer',
              icns: this.icon
            },

          (err: any, stdout?: string, stderr?: string) => {


            process.chdir(cwd);
            if((this._out!==null) && (stdout!==undefined)) {
              this._log("[EXECUTOR::"+this.name+"][STDOUT][SUDO:"+(this._sudo? 'TRUE':'FALSE')+"] \n -------------- \n");
              this._log(stdout);
            }

            if((this._err!==null) && (stderr!==undefined)) {
              this._log("[EXECUTOR::"+this.name+"][STDERR][SUDO:"+(this._sudo? 'TRUE':'FALSE')+"] \n -------------- \n");
              this._log(stderr);
            }


            if (this.didExecFail(stderr)) {
              reject(new ExecutorException(err, this._sudo, stdout, stderr));
            } else {
              this.success = true;
              resolve(this);
            }
          }
        );
      });
  }
}
