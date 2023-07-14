
export enum MetadataType {
    TEXT,
    ANY,
    URI
}

export interface Metadata {
    key:string;
    type:MetadataType;
    value:any;
}