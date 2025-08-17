import AssuranceModel, {ControlNode, ControlTree} from "./common/AssuranceModel.js";
import {ApplicationUnit} from "../organization/ApplicationUnit.js";
import DexcaliburProject from "../DexcaliburProject.js";
import AssuranceReport, {Match} from "./common/AssuranceReport.js";
import {Device} from "../Device.js";
import Asset from "./common/Asset.js";
import Threat from "./common/Threat.js";
import {Metadata} from "./common/Metadata.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import ControlAssessment from "./common/ControlAssessment.js";
import Control from "./common/Control.js";
import {IControl} from "./common/IControl.js";

export interface ExportOptions {
    sampling:boolean;
    samplingSize?:number;
    groupSampleByNode?:boolean;
    appendDevice?:boolean;
    appendApp?:boolean;
    appendPlatform?:boolean;
    embedKpis?:boolean;
    clean?:boolean;
}


/**
 *
 */
export class ExplainedReport {

    private _model: AssuranceModel;
    private _appunit: ApplicationUnit;
    private _project: DexcaliburProject;
    private _report: AssuranceReport;
    private _device: Device;
    private _options: ExportOptions;


    title: string;

    description = "";

    referential: any = {};

    modified: Date = (new Date());

    primaryAssets: Asset[] = [];

    secondaryAssets: Asset[] = [];

    globalThreats: Threat[] = [];

    controls: any[] = [];

    metadata: Metadata[] = [];


    device: any = null;

    application: any = null;

    constructor() {

    }

    static build(pModel: AssuranceModel, pReport: AssuranceReport,
                 pApp: Nullable<ApplicationUnit>, pDev: Nullable<Device>,
                 pProject: Nullable<DexcaliburProject>, pOptions: ExportOptions): ExplainedReport {

        const rep = new ExplainedReport();

        rep._options = pOptions;

        rep.setModel(pModel);
        if (pApp != null) {
            rep.setAppUnit(pApp);
        }
        if (pDev != null) {
            rep.setDevice(pDev);
        }
        if (pProject != null) {
            rep.setProject(pProject);
        }
        rep.setReport(pReport, pOptions);

        console.log("BUILD CONTROL RESULTS > ");
        rep._buildControlResults(pOptions);


        console.log("BUILT REPORT > ", rep);
        return rep;
    }

    private _doSampling(pMatches: any[], pOptions: any): any {

        let out: any[] = [];

        if (pOptions.grpNode) {
            const groups: any = {};

            pMatches.map(m => {
                if (groups[m.node.__] == null) {
                    groups[m.node.__] = [];
                }
                if (groups[m.node.__].length < pOptions.grpSize) {
                    groups[m.node.__].push(m);
                }
            });


            console.log("EXPLAIN :  SAMPLED (WITH GRP) : ", out);
            Object.values(groups).map(x => {
                out = out.concat(x)
            });
        } else {

            console.log("EXPLAIN :  SAMPLED (NO GRP): ", out);
            out = pMatches.slice(0, pOptions.grpSize);
        }
        return out;
    }

    setModel(pModel: AssuranceModel): void {
        this._model = pModel;

        this.title = pModel.name;
        this.description = pModel.description;
        this.referential = {
            uid: pModel.getID(),
            version: pModel.getVersion(),
            official: pModel.generic,
            authors: pModel.getAuthor(),
            release: pModel.getRelease(),
            links: pModel.getLinks()
        };
    }

    setAppUnit(pApp: ApplicationUnit): void {
        this._appunit = pApp;
        this.application = {
            package: pApp.packageID,
            os: pApp.os
        }
    }

    setProject(pProject: DexcaliburProject): void {

        if (this.application != null) {
            this.application.version = pProject.meta['version'];
        }
    }


    setReport(pReport: AssuranceReport, pOptions: ExportOptions): void {
        this._report = pReport;
    }

    setDevice(pDevice: Device): void {
        this._device = pDevice;

        this.device = {
            uid: pDevice.getUID(),
            os: pDevice.os,
            emulated: pDevice.isEmulated,
            arch: pDevice.model
        };
    }

    private _transformMatches(pMatches: any[]): any[] {

        return pMatches.map((x: Match) => {
            // @ts-ignore
            x.node.__ = NodeInternalTypeName[x.node.__] as any;
            return x;
        });
    }

    private _cleanControl(pControl: ControlAssessment | Control): any {
        let out: any = {
            metadata: pControl.metadata,
            name: pControl.name,
            id: pControl.id,
            links: (pControl as any).links
        };

        // removed : assessments

        ['tags', 'children'].map(x => {
            if ((pControl as any)[x] != null
                && Array.isArray((pControl as any)[x])
                && (pControl as any)[x].length > 0) {
                out[x] = (pControl as any)[x];
            }
        });

        ['verified', 'country', 'addDate', 'category'].map(x => {
            if ((pControl as any)[x] != null) {
                out[x] = (pControl as any)[x];
            }
        });


        return out;
    }

    private _buildControlResults(pOptions: any): void {

        let ctrl: IControl;
        let r: Record<string, any> = {};
        let tree: ControlTree = {};

/*
        for (let canonicalUID in this._report.matches) {
            ctrl = this._model.searchControlByCID(canonicalUID);
            if (ctrl != null) {
                (ctrl as ControlAssessment).matches = this._report.matches[canonicalUID].match;
            }

            r[canonicalUID] = {
                control: ctrl,
                match: this._report.matches[canonicalUID]
            };
        }

        console.log("_buildControlResults", r);

        Object.keys(r).sort((a: string, b: string) => {
            return (a.localeCompare(b) > 0 ? 1 : -1);
        }).map(x => {
            let p = x.split('.');
            let uid: string = "";
            let node: ControlNode;
            let root = tree;

            if (p[0] == "*") p.shift();

            let o = x.lastIndexOf('.');
            let s = -1;
            let e: ControlNode;
            let part: string;


            for (let i = 0; i < p.length + (x.indexOf(':') > o ? 1 : 0); i++) {
                part = p[(i < p.length ? i : p.length - 1)];
                s = part.indexOf(':');

                if (i == p.length) {
                    uid = x;
                } else {
                    if (s > -1) {
                        part = part.slice(0, s);
                    }
                    uid += (i > 0 ? "." : "") + part;
                }

                if (root[part] == null) {
                    node = root[part] = {
                        //parent: (i>0 ? tree[p[i-1]] : undefined),
                        ctrl: (pOptions.clean === true ? this._cleanControl(this._model.searchControlByCID(uid)) : this._model.searchControlByCID(uid)),
                        canonicalID: uid,
                        children: {}
                    };


                    if (i > 0) {
                        e = (i < p.length ? root[p[i - 1]] : root[p[i - 2]]);
                        if (e != null) {
                            if (e.children == null) {
                                e.children = {};
                            }
                            e.children[part] = node;
                        }
                    }
                } else {
                    node = root[part];
                }

                if (r["*." + uid] != null) {
                    if (this._options.sampling == true) {
                        node.matches = this._doSampling(
                            r["*." + uid].match.match,
                            {
                                grpSize: this._options.samplingSize,
                                grpNode: this._options.groupSampleByNode
                            }
                        );
                    } else {
                        node.matches = r["*." + uid].match.match;
                    }
                    node.matches = this._transformMatches(node.matches);
                }

                if (node.children != null) {
                    root = node.children;
                }
            }
        });

        this.controls = Object.values(tree);*/
    }

    toJsonObject(): any {
        let doc: any = {
            // model
            title: this.title,
            description: this.description,
            referential: this.referential,
            // results
            controls: this.controls
        };

        if (this._options.appendDevice) {
            doc.device = this.device;
        }
        /*if(this._options.appendPlatform){
            doc.platform = this.platform;
        }*/
        if (this._options.appendApp) {
            doc.application = this.application;
        }

        return doc;

    }
}