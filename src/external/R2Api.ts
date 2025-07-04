import * as _net_ from "net";

import {R2Pipe} from "./R2Pipe.js";


export class R2Api {

    _ctx:R2Pipe;


    constructor(pInstance:R2Pipe) {
        this._ctx = pInstance;
    }


    getBuffer(addr, size, cb) {
        let dataBuffer = Buffer.from([]);
        const server = _net_.createServer(client => {
            client.on('data', data => {
                dataBuffer = Buffer.concat([dataBuffer, data]);
            });
            client.on('end', _ => {
                cb(null, dataBuffer);
                client.destroy();
                server.close();
            });
            client.on('error', err => {
                cb(err);
            });
        });
        server.listen(0, () => {

            const port = (server.address() as any).port;
            const command = 'wts 127.0.0.1:' + port + ' ' + size + '@ ' + addr;
            this._ctx.runCmd(command);
        });
    }

    async call(s):Promise<any>{
        return await this._ctx.runCmd("'" + s);
    }

    async callAt(s, addr):Promise<any>{
        return await this._ctx.runCmd(s + "@0x" + Number(addr).toString(16));
    }

    async cmdAt(s, addr):Promise<any> {
        return await this._ctx.runCmd(s + "@0x" + Number(addr).toString(16));
    }

    async cmd(s):Promise<any> {
        return await this._ctx.runCmd(s);
    }
}