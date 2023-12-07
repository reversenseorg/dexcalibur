export interface IpGeolocation {
    countryCode:string;
    coord?:any;
}

/**
 * An helper to perform geolocation of IP address
 * @class
 */
export class GeoIpHelper {

    constructor() {

    }

    /**
     * To perform IP geolocation using internal DB
     * @param pIpAdress
     */
    locate(pIpAdress:string):IpGeolocation {
        return {
            countryCode: 'US'
        };
    }
}