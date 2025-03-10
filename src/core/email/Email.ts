
export interface EmailOptions {
    subject:string,
    raw:string,
    html:string
}

/**
 * 
 */
export class Email {

    subject:string;
    raw:string;
    html:string;

    constructor(pOptions:EmailOptions) {
        if(pOptions.subject) this.subject = pOptions.subject;
        if(pOptions.raw) this.raw = pOptions.raw;
        if(pOptions.html) this.html = pOptions.html;
    }

    getSubject():string {
        return this.subject;
    }

    getRawText():string {
        return this.raw;
    }

    getHTML():string {
        return this.html;
    }
}