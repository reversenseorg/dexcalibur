export interface  AndroidPackageInstallOptions {
    multiple:boolean;
    opts:AndroidInstallOptionsEnum[];
}

export enum  AndroidInstallOptionsEnum {
    REPLACE = '-r',
    DOWNGRADE = '-d',
    TEST = '-t',
    PARTIAL = '-p',
    GRANT_ALL = '-g',
    INSTANT = '--instant'
}
