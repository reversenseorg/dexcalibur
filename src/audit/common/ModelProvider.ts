


export interface ProviderOptions {
    adapter:string;
    authstring:string;
}


export interface ModelProviderOptions {
    name:string;
    provider:ProviderOptions;
    mapping:string;
}


export class ModelProvider {

    name:string = "";
    provider:ProviderOptions;
    mapping:string;

    constructor(pOptions:ModelProviderOptions) {

    }
}