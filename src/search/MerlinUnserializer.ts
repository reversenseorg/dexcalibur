import {SerializedMerlinOperation, SerializedMerlinPrimitive} from "../audit/common/SerializedMerlinPrimitive.js";
import {MerlinSearchRequest, Operation, OperationType} from "./MerlinSearchRequest.js";
import {IStringIndex, Nullable} from "../core/IStringIndex.js";
import {NodeType} from "../persist/orm/NodeType.js";
import {MerlinAndroidRule} from "./MerlinAndroidRule.js";
import {MerlinFlutterRule} from "./MerlinFlutterRule.js";
import {MerlinIosRule} from "./MerlinIosRule.js";
import {MerlinRule, MerlinRuleOptions, SearchOptions} from "./MerlinRule.js";
import {OperatingSystem} from "../OperatingSystem.js";
import {MerlinUnserializerException} from "./error/MerlinUnserializerException.js";
import {MerlinSearchRequestException} from "./error/MerlinSearchRequestException.js";


export class MerlinUnserializer {


/*
    static fromSerializedOperation(pObject:SerializedMerlinOperation):Operation {

        switch (pObject.op){
            case
        }
        let ope:Operation = {
            type:
        };

        return ope;
    }


 */
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
        try{
            // unserialize req options (base node)
            if(pObject.opts!=null){
                reqOpts = MerlinUnserializer.fromSerializedOptions(pObject.opts);
            }else{
                reqOpts = { not:false };
            }

            // search node
            nodeType = NodeType.getTypeByName(pObject.node);

            // unserialize single request
            if(pObject.request!=null){

                // most basic operation for a single request is a search
                reqOpers.push({
                    type: OperationType.SEARCH,
                    args: {
                        pattern: MerlinSearchRequest.parseCondition(pObject.request, reqOpts)
                    }
                });

                // if more operations are specified, append it :
                pObject.oper.map(x => {
                    reqOpers.push( x as Operation);//MerlinUnserializer.fromSerializedMerlinOperation(x));
                })

                options.request = new MerlinSearchRequest(null, nodeType, reqOpers);
            }

            // unserialize rule options (including taint-related requests)




            // unserialize
            switch (pObject.os){
                case "android":
                    req = new MerlinAndroidRule({

                    })
                    break;
                case "flutter":
                    req = new MerlinFlutterRule({

                    })
                    break;
                case "ios":
                    req = new MerlinIosRule({

                    })
                    break;
                default:
                    req = new MerlinRule(
                        pObject.os==null ? OperatingSystem.NONE : pObject.os as OperatingSystem,
                        pObject
                    )
                    break;
            }

        }catch(err:any){
            if(nodeType==null){
                throw MerlinSearchRequestException.MISSING_NODE_TYPE(pObject.node)
            }
        }



        return req;
    }
}