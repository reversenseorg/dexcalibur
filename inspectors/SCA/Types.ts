
export interface FileBasedProof {
    /**
     * File Node UID
     */
    file: string,
    /**
     * File path
     */
    path: string,
    /**
     * Text description of types
     */
    type: string;
}


export interface ScaJavaLibraryEvent {
    libraryName:string;
    libraryVersion: string;
    proof?: FileBasedProof
}