// src/parser/DexParser.ts

import {IParser, IParserFeature, IParserOptions, IResults} from "./IParser.js";
import DexcaliburProject from "../DexcaliburProject.js";
import ModelResource from "../ModelResource.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {TagUUID} from "@dexcalibur/dexcalibur-orm";
import ModelStringValue from "../ModelStringValue.js";
import {DexStructures} from "../android/DexStructures.js";
import ModelField from "../ModelField.js";
import ModelClass from "../ModelClass.js";
//import * as Log from "../Logger.js";
import {
    ArrayType,
    BoolType,
    ClassRefType,
    FloatType,
    IntType,
    NativeBackend,
    UnknownType,
    VoidType
} from "../types/common.js";
import {DataType} from "../types/DataType.js";
import {MetadataType} from "../audit/common/Metadata.js";
import ModelMethod from "../ModelMethod.js";
import {ModelRegister} from "../elixir/ModelRegister.js";
import {RegisterType} from "../elixir/common.js";

//let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export namespace Dex {

    import ClassInfo = DexStructures.ClassInfo;

    export interface Results extends IResults<ModelResource<any>> {
        ok: ModelResource<any>;
        invalid: any[];
    }

    /**
     * Represents a fully parsed DEX file
     */
    export class DexFile {
        header: DexStructures.DexHeader;
        strings: string[] = [];
        types: string[] = [];
        protos: DexStructures.ProtoIdItem[] = [];
        fields: ModelField[] = []; //DexStructures.FieldInfo[] = [];
        methods: ModelMethod[] = [];
        classes: ModelClass[] = []; //DexStructures.ClassInfo[] = [];
        mapList: Nullable<DexStructures.MapList> = null;

        fieldsRaw: DexStructures.FieldIdItem[] = [];

        constructor(header: DexStructures.DexHeader) {
            this.header = header;
        }

        /**
         * Parse a DEX file from buffer
         */
        static fromBuffer(buffer: Buffer, offset: number = 0): DexFile {
            const header = DexStructures.DexHeader.fromBuffer(buffer, offset);
            const dexFile = new DexFile(header);

            // Parse strings
            dexFile.parseStrings(buffer);

            // Parse types
            dexFile.parseTypes(buffer);

            // Parse protos
            dexFile.parseProtos(buffer);

            // Parse fields
            dexFile.parseFields(buffer);

            // Parse methods
            dexFile.parseMethods(buffer);

            // Parse classes
            dexFile.parseClasses(buffer);

            // Parse map list (optional but useful)
            if (header.mapOff !== 0) {
                dexFile.mapList = DexStructures.MapList.fromBuffer(buffer, header.mapOff);
            }

            return dexFile;
        }

        static createTypeFromDalvikString(pDescriptor: string): DataType {
            let pos = 0;
            let arrayDepth = 0;

            // Count array dimensions
            while (pDescriptor[pos] === '[') {
                arrayDepth++;
                pos++;
            }

            let baseType: DataType;
            const typeChar = pDescriptor[pos];

            // Parse base type
            switch (typeChar) {
                // Primitives
                case 'V': baseType = new VoidType(NativeBackend.DEX); break;
                case 'Z': baseType = new BoolType(NativeBackend.DEX); break;
                case 'B': baseType = new IntType(NativeBackend.DEX, 8, true, 'byte'); break;
                case 'S': baseType = new IntType(NativeBackend.DEX, 16, true, 'short'); break;
                case 'C': baseType = new IntType(NativeBackend.DEX, 16, false, 'char'); break;
                case 'I': baseType = new IntType(NativeBackend.DEX, 32, true, 'int'); break;
                case 'J': baseType = new IntType(NativeBackend.DEX, 64, true, 'long'); break;
                case 'F': baseType = new FloatType(NativeBackend.DEX, 32, 'float'); break;
                case 'D': baseType = new FloatType(NativeBackend.DEX, 64, 'double'); break;

                // Object reference
                case 'L': {
                    const endPos = pDescriptor.indexOf(';', pos);
                    if (endPos === -1) {
                        baseType = new UnknownType(NativeBackend.DEX, pDescriptor);
                    } else {
                        const className = pDescriptor.substring(pos + 1, endPos).replace(/\//g, '.');
                        baseType = new ClassRefType(className, NativeBackend.DEX, 32);
                    }
                    break;
                }

                default:
                    baseType = new UnknownType(NativeBackend.DEX, pDescriptor);
            }

            // Wrap in arrays if needed
            for (let i = 0; i < arrayDepth; i++) {
                baseType = new ArrayType(baseType, -1, NativeBackend.DEX);
            }

            return baseType;
        }

        private parseStrings(buffer: Buffer): void {
            let offset = this.header.stringIdsOff;

            for (let i = 0; i < this.header.stringIdsSize; i++) {
                const stringId = DexStructures.StringIdItem.fromBuffer(buffer, offset);
                const stringData = DexStructures.StringDataItem.fromBuffer(buffer, stringId.stringDataOff);
                this.strings.push(stringData.data);
                offset += 4;
            }
        }

        private parseTypes(buffer: Buffer): void {
            let offset = this.header.typeIdsOff;

            for (let i = 0; i < this.header.typeIdsSize; i++) {
                const typeId = DexStructures.TypeIdItem.fromBuffer(buffer, offset);
                this.types.push(this.strings[typeId.descriptorIdx]);
                offset += 4;
            }
        }

        private parseProtos(buffer: Buffer): void {
            let offset = this.header.protoIdsOff;

            for (let i = 0; i < this.header.protoIdsSize; i++) {
                const protoId = DexStructures.ProtoIdItem.fromBuffer(buffer, offset);
                this.protos.push(protoId);
                offset += 12;
            }
        }

        static unarmorFqcn(pFqcn: string): string {
            if( pFqcn.startsWith("L") && pFqcn.endsWith(";")){
                return pFqcn.substring(1, pFqcn.length-1).replace(/\//g, '.');
            }else{
                return pFqcn.replace(/\//g, '.');
            }
        }



        /**
         * To extract fields as partial ModelField from the DEX file
         * @param buffer
         * @private
         */
        private parseFields(buffer: Buffer): void {
            let offset = this.header.fieldIdsOff;

            for (let i = 0; i < this.header.fieldIdsSize; i++) {
                const fieldId = DexStructures.FieldIdItem.fromBuffer(buffer, offset);

                let f:ModelField=new ModelField({
                    metadata: [{ type:MetadataType.TEXT, key:"fieldId", value:fieldId }]
                });

                f.name = this.strings[fieldId.nameIdx];
                f.type = Dex.DexFile.createTypeFromDalvikString(this.types[fieldId.typeIdx]) as  any;
                f.enclosingClass = Dex.DexFile.createTypeFromDalvikString(this.types[fieldId.classIdx]) as any;


                //f.signature();
                //f.oline = src_line;

                //Logger.debug("[DexParser::field] Hashcode : "+f._hashcode);


                // parse value if available
                /* if(src_arr.length>0){
                    // TODO : parse value
                    let fValue = this.parseValue(src_arr.pop(), f.type.name);
                    f.setValue(fValue);
                }*/

                /*const field = new ModelField({
                    name: this.strings[fieldId.nameIdx],
                    type: this.types[fieldId.typeIdx] as any, // store class name instead of ModelClass reference
                    enclosingClass: this.types[fieldId.classIdx] as any, // store class name instead of ModelClass reference
                    metadata: [{ type:MetadataType.TEXT, key:"fieldId", value:fieldId }]
                })*/

                this.fields.push(f);
                this.fieldsRaw.push(fieldId);
                /*
                this.fields.push({
                    className: this.types[fieldId.classIdx],
                    typeName: this.types[fieldId.typeIdx],
                    name: this.strings[fieldId.nameIdx],
                    fieldId: fieldId
                });*/
                offset += 8;
            }
        }

        private parseMethods(buffer: Buffer): void {
            let offset = this.header.methodIdsOff;

            for (let i = 0; i < this.header.methodIdsSize; i++) {
                const methodId = DexStructures.MethodIdItem.fromBuffer(buffer, offset);
                const proto = this.protos[methodId.protoIdx];
                
                // Get parameter types
                let paramTypes: string[] = [];
                let params:ModelRegister[] = []
                if (proto.parametersOff !== 0) {
                    const typeList = DexStructures.TypeList.fromBuffer(buffer, proto.parametersOff);
                    typeList.list.map((idx:number,lIdx  ) =>{
                        paramTypes.push(this.types[idx]);
                        params.push(new ModelRegister({
                            id: lIdx,
                            type: RegisterType.PARAMETER,
                            dataType: Dex.DexFile.createTypeFromDalvikString(this.types[idx]) as any
                        }));
                    });
                }


                let m:ModelMethod=new ModelMethod({
                    name: this.strings[methodId.nameIdx],
                    enclosingClass: Dex.DexFile.createTypeFromDalvikString(this.types[methodId.classIdx]) as any,
                    declaringClass: Dex.DexFile.createTypeFromDalvikString(this.types[methodId.classIdx]) as any,
                    ret: Dex.DexFile.createTypeFromDalvikString(this.types[proto.returnTypeIdx]) as any,
                    params: params,
                    metadata: [
                        { type:MetadataType.ANY, key:"methodId", value:methodId },
                        { type:MetadataType.ANY, key:"proto", value:proto },
                        { type:MetadataType.ANY, key:"shorty", value: this.strings[proto.shortyIdx] },
                    ]
                });

                /*
                this.methods.push({
                    className: this.types[methodId.classIdx],
                    name: this.strings[methodId.nameIdx],
                    returnType: this.types[proto.returnTypeIdx],
                    paramTypes: paramTypes,
                    shorty: this.strings[proto.shortyIdx],
                    methodId: methodId,
                    proto: proto
                });*/

                this.methods.push(m);
                offset += 8;
            }
        }

        private parseClasses(buffer: Buffer): void {
            let offset = this.header.classDefsOff;
            let classes:ClassInfo[] = [];

            for (let i = 0; i < this.header.classDefsSize; i++) {
                const classDef = DexStructures.ClassDefItem.fromBuffer(buffer, offset);
                const fqcn = Dex.DexFile.unarmorFqcn(this.types[classDef.classIdx])

                const cls = new ModelClass({
                    source: (classDef.sourceFileIdx !== 0xFFFFFFFF ? this.strings[classDef.sourceFileIdx] : null),
                    simpleName: fqcn.substring(fqcn.lastIndexOf('.') + 1),
                    name: fqcn,
                    extends: classDef.superclassIdx !== 0xFFFFFFFF ? Dex.DexFile.createTypeFromDalvikString(this.types[classDef.superclassIdx]) as any: null,
                    implements: [],
                    fields: {},
                    methods: {},
                    modifiers: classDef.accessFlags,
                });
                
                const classInfo: DexStructures.ClassInfo = {
                    className: this.types[classDef.classIdx],
                    accessFlags: classDef.accessFlags,
                    superClass: classDef.superclassIdx !== 0xFFFFFFFF ? this.types[classDef.superclassIdx] : null,
                    sourceFile: classDef.sourceFileIdx !== 0xFFFFFFFF ? this.strings[classDef.sourceFileIdx] : null,
                    interfaces: [],
                    staticFields: [],
                    instanceFields: [],
                    directMethods: [],
                    virtualMethods: [],
                    classDef: classDef
                };

                // Parse interfaces
                if (classDef.interfacesOff !== 0) {
                    const typeList = DexStructures.TypeList.fromBuffer(buffer, classDef.interfacesOff);
                    typeList.list.map(idx => {
                        classInfo.interfaces.push(this.types[idx]);
                        cls.implements.push(Dex.DexFile.createTypeFromDalvikString(this.types[classDef.classIdx]) as any);
                    });
                }

                // Parse class data
                if (classDef.classDataOff !== 0) {
                    const classData = DexStructures.ClassDataItem.fromBuffer(buffer, classDef.classDataOff);

                    let fieldIdx = 0;
                    for (const encodedField of classData.staticFields) {
                        fieldIdx += encodedField.fieldIdxDiff;
                        classInfo.staticFields.push({
                            field: this.fields[fieldIdx] as any,
                            accessFlags: encodedField.accessFlags
                        });

                        this.fields[fieldIdx].modifiers = encodedField.accessFlags;
                        cls.fields[this.fields[fieldIdx].name] = this.fields[fieldIdx];
                    }

                    fieldIdx = 0;
                    for (const encodedField of classData.instanceFields) {
                        fieldIdx += encodedField.fieldIdxDiff;
                        classInfo.instanceFields.push({
                            field: this.fields[fieldIdx] as any,
                            accessFlags: encodedField.accessFlags
                        });

                        this.fields[fieldIdx].modifiers = encodedField.accessFlags;
                        cls.fields[this.fields[fieldIdx].name] = this.fields[fieldIdx];
                    }

                    // Process methods
                    let methodIdx = 0;
                    for (const encodedMethod of classData.directMethods) {
                        methodIdx += encodedMethod.methodIdxDiff;
                        const methodInfo = {
                            method: this.methods[methodIdx],
                            accessFlags: encodedMethod.accessFlags,
                            code: null as Nullable<DexStructures.CodeItem>
                        };

                        this.methods[methodIdx].modifiers = encodedMethod.accessFlags;



                        if (encodedMethod.codeOff !== 0) {
                            //methodInfo.code = DexStructures.CodeItem.fromBuffer(buffer, encodedMethod.codeOff);
                            (this.methods[methodIdx] as any).code = DexStructures.CodeItem.fromBuffer(buffer, encodedMethod.codeOff);

                            console.log(`\n${(this.methods[methodIdx].enclosingClass as any).descriptor}.${this.methods[methodIdx].getName()}()`);
                            (this.methods[methodIdx] as any).code.decodedInsns.map(c => {
                                console.log(c.toString());
                            });

                        }

                        //classInfo.directMethods.push(methodInfo);
                        cls.methods[this.methods[methodIdx].getName()] = this.methods[methodIdx];
                    }

                    methodIdx = 0;
                    for (const encodedMethod of classData.virtualMethods) {
                        methodIdx += encodedMethod.methodIdxDiff;
                        const methodInfo = {
                            method: this.methods[methodIdx],
                            accessFlags: encodedMethod.accessFlags,
                            code: null as Nullable<DexStructures.CodeItem>
                        };

                        this.methods[methodIdx].modifiers = encodedMethod.accessFlags;
                        /*
                        if (encodedMethod.codeOff !== 0) {
                            methodInfo.code = DexStructures.CodeItem.fromBuffer(buffer, encodedMethod.codeOff);
                        }

                        classInfo.virtualMethods.push(methodInfo);*/
                        cls.methods[this.methods[methodIdx].getName()] = this.methods[methodIdx];
                    }
                }

                //classes.push(classInfo);
                // this.classes.push(classInfo as any);
                this.classes.push(cls);
                offset += 32;
            }

            //this._importClass(classes);
        }

        /**
         * Get all strings from the DEX file
         */
        getAllStrings(): string[] {
            return this.strings.filter(s => s && s.length > 0);
        }

        /**
         * Get statistics about the DEX file
         */
        getStatistics(): DexStatistics {
            let totalMethods = 0;
            let methodsWithCode = 0;
            let totalInstructions = 0;

            for (const classInfo of (this.classes as any[])) {
                totalMethods += Object.keys(classInfo.methods).length; //directMethods.length + classInfo.virtualMethods.length;

                /*
                for (let k of classInfo.methods) {
                    if (method.code) {
                        methodsWithCode++;
                        totalInstructions += method.code.insnsSize;
                    }
                }*/
            }

            return {
                version: this.header.version,
                fileSize: this.header.fileSize,
                stringCount: this.header.stringIdsSize,
                typeCount: this.header.typeIdsSize,
                protoCount: this.header.protoIdsSize,
                fieldCount: this.header.fieldIdsSize,
                methodCount: this.header.methodIdsSize,
                classCount: this.header.classDefsSize,
                totalMethods: totalMethods,
                methodsWithCode: methodsWithCode,
                totalInstructions: totalInstructions
            };
        }

        /**
         * Convert type descriptor to Java notation
         */
        static typeDescriptorToJava(descriptor: string): string {
            if (descriptor.startsWith('L') && descriptor.endsWith(';')) {
                return descriptor.substring(1, descriptor.length - 1).replace(/\//g, '.');
            }

            const primitiveMap: { [key: string]: string } = {
                'V': 'void',
                'Z': 'boolean',
                'B': 'byte',
                'S': 'short',
                'C': 'char',
                'I': 'int',
                'J': 'long',
                'F': 'float',
                'D': 'double'
            };

            if (descriptor.startsWith('[')) {
                return DexFile.typeDescriptorToJava(descriptor.substring(1)) + '[]';
            }

            return primitiveMap[descriptor] || descriptor;
        }


        /**
         * Get bytecode for a specific method
         */
        getMethodBytecode(classIdx: number, methodIdx: number): Nullable<DexStructures.CodeItem> {
            if (classIdx >= this.classes.length) return null;

            const classInfo = this.classes[classIdx] as any;
            const allMethods = [...classInfo.directMethods, ...classInfo.virtualMethods];

            if (methodIdx >= allMethods.length) return null;

            return allMethods[methodIdx].code;
        }

        /**
         * Get disassembled bytecode for a method
         */
        disassembleMethod(classIdx: number, methodIdx: number): string {
            const code = this.getMethodBytecode(classIdx, methodIdx);
            if (!code) return '';

            return code.disassemble(this.strings);
        }

        /**
         * Get all methods with bytecode
         */
        getAllMethodsWithCode(): Array<{ className: string, methodName: string, code: DexStructures.CodeItem, signature: string }> {
            const results: Array<{ className: string, methodName: string, code: DexStructures.CodeItem, signature: string }> = [];

            for (const classInfo of this.classes as any[]) {
                for (const methodInfo of [...classInfo.directMethods, ...classInfo.virtualMethods]) {
                    if (methodInfo.code) {
                        const params = methodInfo.method.paramTypes.map(p => DexFile.typeDescriptorToJava(p)).join(', ');
                        const returnType = DexFile.typeDescriptorToJava(methodInfo.method.returnType);

                        results.push({
                            className: DexFile.typeDescriptorToJava(classInfo.className),
                            methodName: methodInfo.method.name,
                            code: methodInfo.code,
                            signature: `${returnType} ${methodInfo.method.name}(${params})`
                        });
                    }
                }
            }

            return results;
        }

        /**
         * Search for methods containing specific opcode
         */
        findMethodsWithOpcode(opcodeMnemonic: string): Array<{ className: string, methodName: string, instructions: DexStructures.DalvikInstruction[] }> {
            const results: Array<{ className: string, methodName: string, instructions: DexStructures.DalvikInstruction[] }> = [];

            for (const classInfo of this.classes as any) {
                for (const methodInfo of [...classInfo.directMethods, ...classInfo.virtualMethods]) {
                    if (methodInfo.code) {
                        const instructions = methodInfo.code.decodeInstructions();
                        const matching = instructions.filter(i => i.mnemonic === opcodeMnemonic);

                        if (matching.length > 0) {
                            results.push({
                                className: DexFile.typeDescriptorToJava(classInfo.className),
                                methodName: methodInfo.method.name,
                                instructions: matching
                            });
                        }
                    }
                }
            }

            return results;
        }
    }

    /**
     * DEX file statistics
     */
    export interface DexStatistics {
        version: string;
        fileSize: number;
        stringCount: number;
        typeCount: number;
        protoCount: number;
        fieldCount: number;
        methodCount: number;
        classCount: number;
        totalMethods: number;
        methodsWithCode: number;
        totalInstructions: number;
    }

    export const SUPPORTED_FORMATS: string[] = ["dex"];

    export class Parser implements IParser<any> {

        FEATURES = [
            IParserFeature.STRUCT
        ];

        UID = "dex_1.0.0";

        FORMAT_NAMES: string[] = ["dex"];

        FILE_EXTENSIONS: string[] = [".dex"];

        description = "Dalvik Executable (DEX) file";

        dexTag: Nullable<TagUUID> = null;

        constructor() {

        }

        async fromBuffer(pBuffer: Buffer, pOffset: number, pOptions: IParserOptions = { encoding: 'utf-8', tags: [], raw: true }): Promise<Results> {
            if (pOptions.tags == null) pOptions.tags = [];

            const res: Results = {
                ok: null as any,
                invalid: [],
                strings: (pOptions.raw ? null : [])
            };

            const tags = pOptions.tags.map(t => t.getUUID());

            try {
                // Parse the DEX file
                const dexFile = DexFile.fromBuffer(pBuffer, pOffset);

                // Create model resource
                const m = new ModelResource<any>({
                    value: null,
                    tags: pOptions.tags.map(t => t.getUUID())
                });

                // Get statistics
                const stats = dexFile.getStatistics();

                // Get all methods with bytecode
                //const methodsWithCode = dexFile.getAllMethodsWithCode();

                // Store parsed data
                const data = {
                    header: {
                        magic: dexFile.header.magic,
                        version: dexFile.header.version,
                        fileSize: dexFile.header.fileSize,
                        checksum: dexFile.header.checksum
                    },
                    statistics: stats,
                    /*classes: dexFile.classes /*.map((c:any) => ({
                        name: DexFile.typeDescriptorToJava(c.className),
                        accessFlags: c.accessFlags,
                        superClass: c.superClass ? DexFile.typeDescriptorToJava(c.superClass) : null,
                        sourceFile: c.sourceFile,
                        interfaceCount: c.interfaces.length,
                        fieldCount: c.staticFields.length + c.instanceFields.length,
                        methodCount: c.directMethods.length + c.virtualMethods.length
                    })),
                    methodsWithCode: methodsWithCode.map(m => ({
                        className: m.className,
                        methodName: m.methodName,
                        signature: m.signature,
                        bytecodeSize: m.code.insnsSize,
                        registersSize: m.code.registersSize,
                        instructionCount: m.code.decodeInstructions().length,
                        // Include first 10 instructions as sample
                        sampleInstructions: m.code.decodeInstructions().slice(0, 10).map(i => i.toString(dexFile.strings))
                    }))*/
                };

                m.setProperty('data', data);
                m.setProperty('dexFile', dexFile);

                res.ok = m;

                // Extract strings if not raw mode
                if (!pOptions.raw && res.strings) {
                    const allStrings = dexFile.getAllStrings();
                    for (const str of allStrings) {
                        const modelStr = new ModelStringValue({
                            value: str,
                            tags: tags
                        });
                        res.strings.push(modelStr);
                    }
                }

            } catch (e) {
                res.invalid.push({
                    error: e instanceof Error ? e.message : String(e),
                    offset: pOffset,
                    stack: e instanceof Error ? e.stack : undefined
                });
            }

            return res;
        }

        setContext(pProject: DexcaliburProject): void {
            // Initialize tags if needed
            // this.dexTag = pProject.getTagManager().getTag("format.dex").getUUID();
        }
    }
}
