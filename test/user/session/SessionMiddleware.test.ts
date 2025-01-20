import {IncomingMessage, ServerResponse} from "http";
import {expect} from 'chai';
import {SessionMiddleware, UnsetMode} from "../../../src/user/session/SessionMiddleware.js";
import {CookieOptions, SameSite} from "../../../src/user/session/Cookie.js";
import {MemoryStore} from "../../../src/user/session/MemoryStore.js";

describe('SessionMiddleware', function() {

    class IncomingRequestMock {

        _hdrs:Record<string, string> = {};

        constructor(pOpts:Record<string, any>) {
            for(let i in pOpts){
                this[i] = pOpts[i];
            }
        }

        getHeader(pKey:string):string {
            return this._hdrs[pKey];
        }
    }

    class ServerResponseMock {

        _hdrs:Record<string, string> = {};


        constructor(pOpts:Record<string, any>) {
            for(let i in pOpts){
                this[i] = pOpts[i];
            }
        }

        setHeader(pKey:string, pVal:string):ServerResponseMock {
            this._hdrs[pKey] = pVal;
            return this;
        }
    }

    describe('make', function() {

        const sessionsFn = SessionMiddleware.make({
            name: "sid",
            secret: ["yet_another_test_secret"],
            cookie: {
                path: '/',
                domain: null,
                httpOnly: true,
                sameSite: SameSite.STRICT,
                secure: false
            },
            store: new MemoryStore(),
            trustProxy: false,
            rolling: true,
            resave: true,
            saveUninitialized: true,
            unset: UnsetMode.DESTROY
        });

        it('Middleware is a function', async function() {
            expect(sessionsFn).to.be.an.instanceof(Function);
            expect(typeof sessionsFn).to.be.equal("function");
        });

        it('Read headers', async function() {

            //const req = new IncomingRequestMock({});
            const req = new IncomingMessage(null);
            const res = new ServerResponse(req);

            req.url = "http://127.0.0.1/home/";

            sessionsFn(req,res,()=>{
                expect((req as any).session).to.be.not.equal(null);
                expect((req as any).sessionID).to.be.not.equal(null);
                console.log(res);
            })

            //expect(sessionsFn).to.be.an.instanceof(Function);
            //expect(typeof sessionsFn).to.be.equal("function");
        });
    });
      
});