import {Register} from "./Register.js";


export class RegisterSpace {

    offset:number = 0;
    regSize:number = 4;
    description:string = "";
    registers:Register[] = [];

    constructor() {

    }

    static fromSpec(pRegPrefix:string, pRegNumber:number, pOffset:number = -1, pRegSize:number = -1, pFirstAt = 0): RegisterSpace {
        const space = new RegisterSpace();
        space.offset = pOffset;
        space.regSize = pRegSize;

        if(pRegNumber>0){
            let i=pFirstAt;
            do{
                space.registers.push(new Register(pRegPrefix+(i*(pRegSize/4))));
                i++;
            }while (i<pRegNumber);
        }

        return space;
    }
}