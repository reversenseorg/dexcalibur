/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import ModelInstruction from "../ModelInstruction.js";
import {ModelRegister} from "./ModelRegister.js";
import {
    ConstantOperand,
    ElixirOpcode,
    ElixirOperationCategory, FieldOperand, LabelOperand, MethodOperand,
    Operand,
    OperandType,
    RegisterOperand
} from "./common.js";
import ModelBasicBlock from "../ModelBasicBlock.js";
import {DataType} from "../types/DataType.js";


export class ElixirInstructionBuilder {


    static register(pRegister: ModelRegister): RegisterOperand {
        return {
            type: OperandType.REGISTER,
            register: pRegister
        };
    }

    static constant(pValue: number | string | boolean | null, pDataType: DataType): ConstantOperand {
        return {
            type: OperandType.CONSTANT,
            value: pValue,
            dataType: pDataType
        };
    }


    static label(pLabel: string): LabelOperand {
        return {
            type: OperandType.LABEL,
            label: pLabel
        };
    }


    static move(pDest: ModelRegister, pSrc: ModelRegister): ModelInstruction {
        return new ModelInstruction({
            opcode: ElixirOpcode.COPY,
            category: ElixirOperationCategory.ASSIGNMENT,
            destination: ElixirInstructionBuilder.register(pDest),
            operands: [ElixirInstructionBuilder.register(pSrc)]
        });
    }

    /**
     * Crée une instruction arithmétique binaire
     */
    static binaryArithmetic(
        pOpcode: ElixirOpcode,
        pDest: ModelRegister,
        pLeft: ModelRegister,
        pRight: ModelRegister | ConstantOperand
    ): ModelInstruction {
        const rightOperand = 'register' in pRight
            ? this.register(pRight as ModelRegister)
            : pRight;

        return new ModelInstruction({
            opcode: pOpcode,
            category: ElixirOperationCategory.ARITHMETIC,
            destination: ElixirInstructionBuilder.register(pDest),
            //operands: [ElixirInstructionBuilder.register(pLeft), rightOperand]
        });
    }

    /**
     * Crée une instruction de branchement conditionnel
     */
    static conditionalBranch(
        pOpcode: ElixirOpcode,
        pLeft: ModelRegister,
        pRight: ModelRegister | ConstantOperand,
        target: string
    ): ModelInstruction {
        const rightOperand = 'register' in pRight
            ? this.register(pRight as ModelRegister)
            : pRight;

        return new ModelInstruction({
            opcode: pOpcode,
            category: ElixirOperationCategory.BRANCH,
            //operands: [this.register(pLeft), rightOperand, this.label(target)]
        });
    }

    /**
     * Crée une instruction de branchement inconditionnel
     */
    static goto(pTarget: string): ModelInstruction {
        return new ModelInstruction({
            opcode: ElixirOpcode.JUMP,
            category: ElixirOperationCategory.BRANCH,
            operands: [this.label(pTarget)]
        });
    }

    /**
     * Crée une instruction de chargement de constante
     */
    static loadConstant(pDest: ModelRegister, value: number | string | boolean | null): ModelInstruction {
        return new ModelInstruction({
            opcode: ElixirOpcode.LOAD_CONST,
            category: ElixirOperationCategory.ASSIGNMENT,
            destination: this.register(pDest),
            operands: [this.constant(value, pDest.dataType)]
        });
    }

    /**
     * Crée une instruction d'accès à un champ
     */
    static loadField(
        pDest: ModelRegister,
        pObj: ModelRegister,
        className: string,
        fieldName: string,
        fieldType: DataType
    ): ModelInstruction {
        const fieldOp: FieldOperand = {
            type: OperandType.FIELD,
            className,
            fieldName,
            fieldType
        };

        return new ModelInstruction({
            opcode: ElixirOpcode.LOAD_FIELD,
            // category: ElixirOperationCategory.MEMORY,
            destination: this.register(pDest),
            operands: [this.register(pObj), fieldOp]
        });
    }

    /**
     * Crée une instruction d'appel de méthode
     */
    static invokeMethod(
        pOpcode: ElixirOpcode,
        dest: ModelRegister | undefined,
        args: ModelRegister[],
        className: string,
        methodName: string,
        signature: string,
        returnType: DataType
    ): ModelInstruction {
        const methodOp: MethodOperand = {
            type: OperandType.METHOD,
            className,
            methodName,
            signature,
            returnType
        };

        const operands: Operand[] = [
            methodOp,
            ...args.map(r => this.register(r))
        ];

        return new ModelInstruction({
            opcode: pOpcode,
            // category: ElixirOperationCategory.METHOD,
            destination: dest ? this.register(dest) : undefined,
            operands
        });
    }

    /**
     * Crée une instruction de retour
     */
    static return(pValue?: ModelRegister): ModelInstruction {
        return new ModelInstruction({
            opcode: ElixirOpcode.RETURN,
            // category: ElixirOperationCategory.METHOD,
            operands: pValue ? [this.register(pValue)] : []
        });
    }

    /**
     * Crée une instruction THROW
     */
    static throw(exceptionReg: ModelRegister): ModelInstruction {
        return new ModelInstruction({
            opcode: ElixirOpcode.THROW,
            // category: ElixirOperationCategory.EXCEPTION,
            operands: [this.register(exceptionReg)],
            /*metadata: {
                comment: 'Throw exception'
            }*/
        });
    }


    static initRegister(pBasicBlock:ModelBasicBlock, pRegister:ModelRegister, pValue:any = undefined):ModelInstruction {
        let operands: Operand[] = [];

        if(pRegister.initialValue!==undefined){
            operands.push(this.constant(
                pRegister.initialValue,
                pRegister.dataType
            ));
        }

        return new ModelInstruction({
            //id: pBasicBlock.stack.length+1,
            opcode: ElixirOpcode.LOAD_CONST,
            // category: ElixirOperationCategory.ASSIGNMENT,
            destination: this.register(pRegister),
            operands,
            /*metadata: {
                comment: `Initialize ${pRegister.name || `r${register.id}`} (${initialValue.kind})`,
                sourceDirective: initialValue.sourceDirective
            }*/
        });
    }
}