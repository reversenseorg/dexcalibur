import AssuranceModel, {ControlNode} from "../common/AssuranceModel.js";
import AssuranceReport from "../common/AssuranceReport.js";
import {DataSegment, Indicator, IndicatorViewType, KpiRule} from "../common/Indicator.js";
import {IndicatorBuilderException} from "../errors/IndicatorBuilderException.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import Util from "../../Utils.js";
import {MatchOccurence} from "../common/Match.js";
import {BomPurpose, BomPurposeUID} from "../../bom/BomPurpose.js";
import {MetadataTopic} from "../common/Metadata.js";



export interface IndicatorBuilderOptions {
    model?: AssuranceModel;
    ctx?:DexcaliburProject;
}

export class IndicatorBuilder {

    ctx:DexcaliburProject;

    constructor( pOptions:IndicatorBuilderOptions) {
        if(pOptions != undefined){
            for(let i in pOptions ){ this[i]=pOptions[i]; }
        }
    }

/*
    private _groupByControl( pRule:KpiRule, pDeth = 1):any {

        const ctrls:Record<string, any> = [];

        ctrlPoint.map(x => {
            // gather control
            const parts = x.split('.');
            const canonicalUUID = parts.slice(0,pDeth).join('.');

            if(ctrls[canonicalUUID]==null){
                ctrls[canonicalUUID] = {
                    matchCount: this.report.matches[x].match.length,
                    assessment: [parts.slice(pDeth+1).join('.')]
                };
            }else{
                ctrls[canonicalUUID].matchCount += this.report.matches[x].match.length;
                ctrls[canonicalUUID].assessment.push(parts.slice(pDeth+1).join('.'));
            }
        });

        return ctrls;
    }*/

    private _getExtraData(pEntry:ControlNode):any {
        let extra:Record<string, Record<string, any>> = {};

        for(let k in pEntry){
            if(k!='control' && k!='matches'){
                extra = pEntry[k];
            }
        }

        return extra;
    }


    private _updateExtra(pExisting:any, pFresh:any, pOverride = false):any {
        let extra:any = pExisting;

        for(let k in pFresh){
            if(extra[k]==null){
                extra[k] = pFresh[k];
            }
        }

        return extra;
    }

    /**
     * To transform canonical uid to go up `pTime`times
     *
     * @param pPath
     * @param pTime
     * @private
     */
    private _goUpOf(pPath:string, pTime:number):string {
        if(pTime===0) return pPath;

        let path = pPath;
        let up = 0;
        const parts = pPath.split('.');
        let last = parts.pop();
        const l = last.indexOf(":");

        if(l>-1){
            last = last.substring(0,l);
            path = parts.join(".")+"."+last
        }else{
            path = parts.join(".");
        }
        up++;

        if(pTime>1){
            while(parts.length>0 && up<pTime){
                parts.pop();
                path = parts.join(".");
                up++;
            }
        }

        return path;
    }

    /**
     * To count by applying rule on detected control point or control assessment
     *
     * @param pReport
     * @param pRule
     * @private
     */
    private async _groupByControlRule( pReport:AssuranceReport, pRule:KpiRule ):Promise<any> {

        if(pReport.getContext()==null){
            throw new Error("Context is undefined");
        }

        const grouped:Record<string, any> = {};
        let groupOn:any;
        let c:ControlNode;
        const purps:Record<BomPurposeUID, BomPurpose> = {};

        let datapath = pRule.data;
        let goUp = 0;
        while(datapath.startsWith('parent.')){
            datapath = datapath.substring('parent.'.length);
            goUp++;
        }

        (await (pReport.getContext().getContext().getSignatureServer()).getBomPurposes()).map(p => {
            purps[p.uid] = p;
        })

        if(datapath.startsWith('metadata[')){
            // @ts-ignore
            const m = /^metadata\[(?<ppt>[a-zA-Z0-9._]+)(?<v>[^\]]+)\]$/.exec(datapath);

            if(m!=null && m.groups!=null){
                const v = m.groups.v.substring(1);


                for(let i=0; i<pReport.matches.length; i++){
                    if(goUp>0){
                        c = pReport.searchControlNode(this._goUpOf(pReport.matches[i], goUp ));
                    }else{
                        c = pReport.searchControlNode(pReport.matches[i]);
                    }

                    if(c==null) continue;

                    let found=0;
                    c.ctrl.metadata.map((x:any) => {
                        if(x[(m.groups as any).ppt]===v){
                            found+=1;
                            const p  = x.value;

                            if(grouped[p]==null){
                                grouped[p] = {
                                    name:  (v===MetadataTopic.PURPOSE && purps[p]!=null? purps[p].label : p),
                                    controls: [c.canonicalID],
                                    evidences: c.ctrl.matches.length
                                };
                            }else{
                                grouped[p].controls.push(c.canonicalID);
                                grouped[p].evidences += c.ctrl.matches.length;
                            }
                        }
                    });

                    if(found===0){
                        if(grouped['none']==null){
                            grouped['none'] = {
                                name:  'None',
                                controls: [c.canonicalID],
                                evidences: c.ctrl.matches.length,
                                //extra: this._getExtraData(c)
                            };
                        }else{
                            grouped['none'].controls.push(c.canonicalID);
                            grouped['none'].evidences += c.ctrl.matches.length;
                            /*grouped['none'].extra = this._updateExtra(
                                grouped['none'].extra,
                                this._getExtraData(c)
                            );*/
                        }
                    }
                }
            }
        }else{


            for(let i=0; i<pReport.matches.length; i++) {
                if(goUp>0){
                    c = pReport.searchControlNode(this._goUpOf(pReport.matches[i], goUp ));
                }else{
                    c = pReport.searchControlNode(pReport.matches[i]);
                }

                //c = pReport.searchControlNode(pReport.matches[i]);
                if (c == null) continue;

                groupOn = Util.readValue( c.ctrl, datapath);

                if(grouped[groupOn]==null){
                    grouped[groupOn] = {
                        name: groupOn,
                        controls: [c.ctrl],
                        evidences: c.ctrl.matches.length,
                       // extra: this._getExtraData(c)
                    };
                }else{
                    grouped[groupOn].controls.push(c.ctrl);
                    grouped[groupOn].evidences += c.ctrl.matches.length;
                    /*grouped[groupOn].extra = this._updateExtra(
                        grouped[groupOn].extra,
                        this._getExtraData(c)
                    );*/
                }
            }

        }
        return grouped;
    }


    private async _groupByGenericRule( pReport:AssuranceReport, pRule:KpiRule ):Promise<any> {
/*
        const grouped:Record<string, any> = {};

        console.log("groupByGenericRule > skeleton > ",this.skeleton);
        this.skeleton.map((vControlPointMatch:ReportSkeletonEntry)=>{

            let els:any[] = [];
            const el = Utils.readValue(vControlPointMatch,pRule.on);
            if(el==null) return;

            els = (Array.isArray(el) ? el : [el]);

            els.map(vElement => {
                // read nested data
                const groupOn = Utils.readValue( vElement, pRule.data);

                console.log(pRule.on, pRule.data, vElement, groupOn);

                if(grouped[groupOn]==null){
                    grouped[groupOn] = {
                        name: groupOn,
                        controls: [vElement],
                        evidences: (el.match!=null ? el.match.length : 0),
                        extra: this._getExtraData(el)
                    };
                }else{
                    grouped[groupOn].controls.push(vControlPointMatch.control);
                    grouped[groupOn].evidences += vControlPointMatch.match.length;
                    grouped[groupOn].extra = null;
                }
            })

        })

        return grouped;*/
    }


    /**
     * To prepare data segment to render a doughnut
     *
     * @param pReport
     * @param pKPI
     * @private
     */
    private async _prepareDoughnutData( pReport:AssuranceReport, pKPI:Indicator):Promise<DataSegment[]> {
        let segs:DataSegment[] = [];
        let rule:any;
        let data:any;

        for(let i=0; i<pKPI.rules.length; i++){
            rule = pKPI.rules[i];
            switch (rule.on){
                case "control":
                    data = await this._groupByControlRule(pReport, rule);
                    for(let k in data){
                        segs.push({
                            value: data[k].controls.length,
                            label: data[k].name,
                            extra: data[k].extra
                        });
                    }
                    break;
                case "match":
                    data = await this._groupByDataRule(pReport, rule);
                    for(let k in data){
                        segs.push({
                            value: data[k].evidences,
                            label: data[k].name,
                            extra: data[k].extra
                        });
                    }
                    break;
                default:
                    throw IndicatorBuilderException.KPI_RULE_NOT_SUPPORTED(pKPI.getUID(), rule.on);
            }
        }

        return segs;
    }


    private async _prepareRadarData(pReport:AssuranceReport, pKPI:Indicator):Promise<DataSegment[]> {
        let segs:DataSegment[] = [];
        let rule:any;
        let data:any;

        for(let i=0; i<pKPI.rules.length; i++){
            rule = pKPI.rules[i];
            data = await this._groupByGenericRule(pReport, rule);

            for(let k in data){
                segs.push({
                    value: data[k].controls.length,
                    label: data[k].name,
                    extra: data[k]
                });
            }
            break;
        }
        //console.log("prepareDougnutData : ",this.kpi, this.report.model, this.report.matches)

        return segs;
    }


    /**
     *
     *
     * @param pReport
     * @param pKPI
     * @private
     */
    private async _prepareStackedData( pReport:AssuranceReport, pKPI:Indicator):Promise<DataSegment[]> {
        let segs:DataSegment[] = [];
        let rule:any;
        let data:any;

        // first segment is about the whole data (size, color, ...)
        // others segments are subparts

        for(let i=0; i<pKPI.rules.length; i++){
            rule = pKPI.rules[i];
            switch (rule.on){
                case "control":

                    data = await this._groupByControlRule(pReport, rule);

                    for(let k in data){
                        segs.push({
                            value: data[k].controls.length,
                            label: data[k].name,
                            extra: data[k].extra
                        });
                    }
                    break;
                case "match":
                    data = await this._groupByDataRule(pReport, rule);
                    for(let k in data){
                        segs.push({
                            value: data[k].evidences,
                            label: data[k].name,
                            extra: data[k].extra
                        });
                    }
                    break;
                default:
                    throw IndicatorBuilderException.KPI_RULE_NOT_SUPPORTED(pKPI.getUID(), rule.on);
            }
        }

        return segs;
    }

    /**
     * To count by applying rule on matching node
     *
     * @param pReport
     * @param pRule
     * @private
     */
    private async _groupByDataRule(pReport:AssuranceReport, pRule: any):Promise<any> {

        const grouped:Record<string, any> = {};
        let c:ControlNode;
        let groupOn:any;

        console.log("groupByDataRule > ",pRule);

        for(let i=0; i<pReport.matches.length; i++) {
            c = pReport.searchControlNode(pReport.matches[i]);
            if (c == null) continue;

            c.ctrl.matches.map((vMatchOcc:MatchOccurence<any>)=>{
                groupOn = Util.readValue( vMatchOcc, pRule.data);

                if(groupOn==null) return;

                if(grouped[groupOn]==null){
                    grouped[groupOn] = {
                        name: groupOn,
                        controls: [],
                        evidences: 1,
                        /*extra: {
                            ...this._getExtraData(vMatchOcc)
                        }*/
                    };
                }else{
                    grouped[groupOn].controls.push(c.ctrl);
                    grouped[groupOn].evidences += 1;
                    /*grouped[groupOn].extra = this._updateExtra(
                        grouped[groupOn].extra,
                        this._getExtraData(vMatchOcc)
                    );*/
                }
            })
        }

        return grouped;
    }

    /**
     * To create Indicator ready to be draw from a report
     *
     * @param {AssuranceReport} pReport
     * @param {Indicator} pIndicator
     * @method
     */
    async process(pReport:AssuranceReport, pIndicator:Indicator):Promise<Indicator> {

        let data:any;
        switch (pIndicator.view){
            case IndicatorViewType.DOUGHNUT:
                data = await this._prepareDoughnutData( pReport, pIndicator);
                break;
            case IndicatorViewType.RADAR:
                data = await this._prepareRadarData( pReport, pIndicator);
                break;
            case IndicatorViewType.STACKED:
                data = await this._prepareRadarData( pReport, pIndicator);
                break;
            case IndicatorViewType.PROGRESS:
                data = await this._prepareRadarData( pReport, pIndicator);
                break;
            default:
                throw IndicatorBuilderException.VIEW_TYPE_NOT_SUPPORTED(
                            pReport.getUID(),
                            pIndicator.getUID(),
                            pIndicator.view);
        }


        return pIndicator.createWithData( data);
    }
}