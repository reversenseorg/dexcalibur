import {UserAccount} from "../UserAccount";

export class UserSession {

    acc: UserAccount;
    created: any = null;

    // uid of project associated to the current session
    project: string[]

}