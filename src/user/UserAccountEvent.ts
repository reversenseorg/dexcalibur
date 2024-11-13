
export enum UserAccountAction{
    CREATE='create',
    EDIT='edit',
    DROP='drop',
    ACTIVATE='activate',
    LOCK='lock',
    UNLOCK='unlock',
    EMAIL='email'
}


export interface UserAccountEvent {
    action: UserAccountAction,
    msg?:string;
    timestamp: number;
}






export class UserAccountHelper{

    static event(pAction:UserAccountAction, pMsg?:string):UserAccountEvent {
        return {
            action: pAction,
            timestamp: (new Date).getTime(),
            msg:pMsg,
        }
    }
}