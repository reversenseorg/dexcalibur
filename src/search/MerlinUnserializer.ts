import {
    SerializedInnerjoinOperationArgs,
    SerializedMerlinOperation,
    SerializedMerlinPrimitive,
    SerializedSearchOperationArgs,
    SerializedSearchRequest
} from "../audit/common/SerializedMerlinPrimitive.js";
import {InnerjoinOperationArgs, MerlinSearchRequest, Operation, OperationType} from "./MerlinSearchRequest.js";
import {IStringIndex, Nullable} from "../core/IStringIndex.js";
import {NodeType} from "@dexcalibur/dexcalibur-orm";
import {MerlinAndroidRule} from "./MerlinAndroidRule.js";
import {MerlinFlutterRule} from "./MerlinFlutterRule.js";
import {MerlinIosRule} from "./MerlinIosRule.js";
import {MerlinRule, MerlinRuleOptions, SearchOptions} from "./MerlinRule.js";
import {OperatingSystem} from "../platform/OperatingSystem.js";
import {MerlinUnserializerException} from "./error/MerlinUnserializerException.js";
import {MerlinSearchRequestException} from "./error/MerlinSearchRequestException.js";
import ModelStringValue from "../ModelStringValue.js";


export class MerlinUnserializer {

    static operationTypeMapping:IStringIndex<OperationType> = {
        search: OperationType.SEARCH,
        aggregate: OperationType.AGGR,
        filter: OperationType.FILTER,
        offset: OperationType.SIZE,
        limit: OperationType.SIZE,
        validate: OperationType.VALIDATE,
        before: OperationType.TIME,
        after: OperationType.TIME,
        union: OperationType.UNION,
        intersect: OperationType.INTERSECT,
        join: OperationType.JOIN,
        select: OperationType.INNERJOIN,
        sources: OperationType.TAINT_SRC,
        sinks: OperationType.TAINT_SINK,
        steps: OperationType.TAINT_STEP
    };


    /**
     * To unserialize operations
     *
     * Most of operations are poor object and are not subject to serializing,
     * however some operations take Merlin rules or request as parameters.
     * Such operations MUST be unserialized.
     *
     * @param {SerializedMerlinOperation} pObject Serialized operation
     * @return {Operation} Unserialized operation
     * @method
     * @static
     */
    static fromSerializedMerlinOperation(pObject:SerializedMerlinOperation):Operation {
        let ope:Nullable<Operation> = null;
        let opts:any = {};
        switch(pObject.type){
            case OperationType.SEARCH:
                ope = {
                    type: OperationType.SEARCH,
                    args: {
                        pattern: [
                            MerlinSearchRequest
                                .parseCondition2((pObject.args as SerializedSearchOperationArgs).pattern, {not:false})
                            ]
                    }
                };
                break;
            case OperationType.INNERJOIN:
                ope = {
                    type: OperationType.INNERJOIN,
                    args: {
                        on: (pObject.args as any).on
                    }
                };
                if((pObject.args as InnerjoinOperationArgs).cond != null){
                    (ope.args as InnerjoinOperationArgs).cond = MerlinSearchRequest.parseCondition2((pObject.args as SerializedInnerjoinOperationArgs).cond, {not:false})
                }
                break;
            case OperationType.VALIDATE:
                ope = {
                    type: OperationType.VALIDATE,
                    args: {}
                };
                for(let i in pObject.args){
                    if(i!="regexp"){
                        (ope.args as any)[i] = pObject.args[i];
                    }else{
                        (ope.args as any).regexp = new RegExp((pObject.args as any).regexp)
                    }
                }
                break;
            case OperationType.UNION:
            case OperationType.INTERSECT:
            case OperationType.JOIN:
                ope = {
                    type: pObject.type, //OperationType.VALIDATE,
                    args: {
                        request: MerlinUnserializer.fromSerializedSearchRequest((pObject.args as any).request) //request
                    }
                };

                break;
            case OperationType.AGGR:
            case OperationType.TIME:
            case OperationType.SIZE:
            case OperationType.FILTER:
                ope = {
                    type: pObject.type,
                    args: (pObject.args as any)
                };
                break;
            default:
                break;
        }

        if(ope==null){
            throw MerlinUnserializerException.MISSING_OPERATION_TYPE(pObject.type+"");
        }


        return ope;
    }

    static fromSerializedOptions(pObject:string[]):SearchOptions {
        let opt:SearchOptions = { not:false };
        pObject.map(x => {
            switch (x){
                case 'nocase':
                    opt.nocase = true;
                    break;
                case 'query_string':
                    opt.query_string = true;
                    break;
                case 'range':
                    opt.range = (pObject as any).range as string[];
                    break;
                case 'copyTo':
                    opt.copyTo = true;
                    break;
                case 'not':
                    opt.not = true;
                    break;
                case 'regexp':
                    opt.regexp = true;
                    break;
                case 'strict':
                    opt.strict = true;
                    break;
            }
        });

        return opt;
    }


    /**
     * To create search request instance from serialized one
     *
     * Serialized Requests mainly come from database and API
     *
     * @param {SerializedSearchRequest} pRequest Poor object representing serialized request
     * @static
     * @method
     */
    static fromSerializedSearchRequest(pRequest:SerializedSearchRequest):MerlinSearchRequest {
        let reqOpts:any = {};
        let reqOpers:Operation[] = [];
        let nodeType:NodeType;

        // unserialize req options (base node)
        if(pRequest.opts!=null){
            reqOpts = MerlinUnserializer.fromSerializedOptions(pRequest.opts);
        }else{
            reqOpts = { not:false };
        }

        // search node
        if(pRequest.node==="strings"){
            nodeType = ModelStringValue.TYPE;
        }else{
            nodeType = NodeType.getTypeByName(pRequest.node);
        }
        //nodeType = NodeType.getTypeByName(pRequest.node);

        // unserialize single request
        if(pRequest.pattern!=null){

            // most basic operation for a single request is a search
            reqOpers.push({
                type: OperationType.SEARCH,
                args: {
                    pattern: [MerlinSearchRequest.parseCondition2(pRequest.pattern, reqOpts)]
                }
            });
        }

        if(pRequest.oper != null){
            if(Array.isArray(pRequest.oper)){
                // if more operations are specified, append it :
                pRequest.oper.map(x => {
                    reqOpers.push( x as Operation);//MerlinUnserializer.fromSerializedMerlinOperation(x));
                })
            }
        }

        return new MerlinSearchRequest(null, nodeType, reqOpers);
    }
    /**
     * To unserialize a merlin search request from a SerializedMerlinPrimitive
     *
     * @param pObject
     */
    static fromSerializedMerlinPrimitive(pObject:SerializedMerlinPrimitive):MerlinRule {

        let nodeType:Nullable<NodeType> = null;
        let req:Nullable<MerlinRule> = null;
        let reqOpers:Operation[] = [];
        let options:MerlinRuleOptions =  {}
        let reqOpts:SearchOptions;
        let errors:any[] = [];

        try{

            // if a single request is specified
            if(pObject.request!=null) {

                // unserialize req options (base node)
                if (pObject.request.opts != null) {
                    try{
                        reqOpts = MerlinUnserializer.fromSerializedOptions(pObject.request.opts);
                    }catch (e){
                        errors.push({
                            location: 'unserialize',
                            what: 'opts',
                            msg: e.msg,
                            stack: e.stack
                        })
                        reqOpts = {not: false};
                    }
                } else {
                    reqOpts = {not: false};
                }


                // unserialize single request
                if (pObject.request.pattern != null) {

                    // most basic operation for a single request is a search
                    try{
                        reqOpers.push({
                            type: OperationType.SEARCH,
                            args: {
                                pattern: [MerlinSearchRequest.parseCondition2(pObject.request.pattern, reqOpts)]
                            }
                        });
                    }catch (e){
                        errors.push({
                            location: 'unserialize',
                            what: 'pattern',
                            msg: e.msg,
                            stack: e.stack
                        })
                    }
                }


                if (pObject.request.oper != null) {
                    if (Array.isArray(pObject.request.oper)) {
                        // if more operations are specified, append it :
                        pObject.request.oper.map((x:SerializedMerlinOperation) => {
                            switch(x.type){
                                case OperationType.FILTER:
                                    if((x.args as any).pattern != null){

                                        try{
                                            reqOpers.push({
                                                type: OperationType.FILTER,
                                                args: {
                                                    pattern: [MerlinSearchRequest.parseCondition2((x.args as any).pattern,
                                                        ((x.args as any).options!=null?
                                                            (x.args as any).options:null))]
                                                }
                                            });
                                        }catch (e){
                                            errors.push({
                                                location: 'unserialize',
                                                what: 'filter-pattern',
                                                subject: {
                                                    pattern: (x.args as any).pattern,
                                                    options: (x.args as any).options
                                                },
                                                msg: e.msg,
                                                stack: e.stack
                                            })
                                        }
                                    }else{
                                        //console.log('OperationType.FILTER not processed ',x);
                                    }

                                    break;
                                case OperationType.JOIN:
                                case OperationType.INTERSECT:
                                case OperationType.UNION:
                                default:
                                    reqOpers.push(x as Operation);
                                    break;
                            }
                        })
                    }
                }
            }

            // unserialize
            switch (pObject.os){
                case "android":
                    req = new MerlinAndroidRule(options)
                    break;
                case "flutter":
                    req = new MerlinFlutterRule(options)
                    break;
                case "ios":
                    req = new MerlinIosRule(options)
                    break;
                case "*":
                default:
                    req = new MerlinRule(
                        pObject.os==null ? OperatingSystem.NONE : pObject.os as OperatingSystem,
                        options
                    )
                    break;
            }


            if(pObject.request!=null){
                try{
                    if(pObject.request.node==="strings"){
                        nodeType = ModelStringValue.TYPE;
                    }else{
                        // search node
                        nodeType = NodeType.getTypeByName(pObject.request.node);
                    }
                    req.request = new MerlinSearchRequest(null, nodeType, reqOpers);

                }catch(errNodeType:any){
                    switch (pObject.os){
                        case "android":
                        case "flutter":
                        case "ios":
                            req.request = req.getRequestByNode(pObject.request, reqOpts);
                            break;
                    }


                    if(req.request==null){
                        console.log(pObject.request.node, pObject.os, NodeType.ALL[pObject.request.node]);
                        console.log(pObject);


                        errors.push({
                            location: 'unserialize',
                            what: 'node-type',
                            subject: {
                                node: pObject.request.node,
                                os: pObject.os
                            }
                        });

                        throw MerlinSearchRequestException.MISSING_NODE_TYPE(pObject.request.node);
                    }
                }
            }

            // unserialize rule options (including taint-related requests)
            if(pObject.sinks!=null){
                pObject.sinks.map( (x,i) => {
                    const single = MerlinUnserializer.fromSerializedMerlinPrimitive(x)
                    req.sink(single);
                    if(single.hasErrors()){
                        req.addError({
                            location: 'unserialize',
                            what: 'sinks-req',
                            subject: {
                                offset: i,
                                err: single.getErrors()
                            }
                        });
                    }

                });
            }
            if(pObject.sources!=null){
                pObject.sources.map( (x,i) => {
                    const single = MerlinUnserializer.fromSerializedMerlinPrimitive(x)
                    req.sources(single);
                    if(single.hasErrors()){
                        req.addError({
                            location: 'unserialize',
                            what: 'sources-req',
                            subject: {
                                offset: i,
                                err: single.getErrors()
                            }
                        });
                    }
                })
            }
            if(pObject.steps!=null){
                pObject.steps.map( (x,i) => {
                    const single = MerlinUnserializer.fromSerializedMerlinPrimitive(x)
                    req.steps(single);

                    if(single.hasErrors()){
                        req.addError({
                            location: 'unserialize',
                            what: 'steps-req',
                            subject: {
                                offset: i,
                                err: single.getErrors()
                            }
                        });
                    }
                })
            }

            // to trigger rule on some specific bus events
            if(pObject.on!=null){
                if(typeof pObject.on==="string"){
                    req.on(pObject.on);
                }else{
                    pObject.on.map( x => {
                        req.on(x);
                    })
                }
            }

        }catch(err:any){
            errors.push({
                location: 'unserialize',
                what: 'uncaught',
                msg: err.msg
            });
            console.log(err.message,err.stack);
        }

        if(errors.length>0){
            req.setErrors(errors);
        }


        return req;
    }
}