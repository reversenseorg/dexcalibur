

export enum HookRevisionSubject {
    PROLOGUE="prologue",
    STRATEGY="strategy",
    HOOKSET="hookset"
}

export enum RevisionOperation {
    ADDED="added",
    EDIT="edit",
    REMOVED="removed"
}


export interface HookRevision {
    time: number,
    subject: HookRevisionSubject,
    operation: RevisionOperation,
    data?:any;
    description?:string;
}