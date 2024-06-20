

export enum HookRevisionSubject {
    PROLOGUE="prologue",
    STRATEGY="strategy",
}

export enum RevisionOperation {
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