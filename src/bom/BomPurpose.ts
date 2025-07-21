
export type BomPurposeUID = string;

export interface BomPurpose {
    id: string;
    uid: BomPurposeUID;
    label: string;
    description: string;
    version: number;
    style: {
        bg: string
    }
}