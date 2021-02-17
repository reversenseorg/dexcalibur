/**
 * Represents a token into search pattern
 *
 * @class
 */
export class SearchToken {

    /**
     * If the tokan is associated to an iterable field
     */
    iter: boolean = false;
    name:string = null;

    constructor(pConfig:any) {
        for (let i in pConfig)
            if (this.hasOwnProperty(i))
                this[i] = pConfig[i];
    }


    /**
     * To
     * @param pToken
     */
    static parseTokens(pToken:string):SearchToken[] {
        let toks:SearchToken[] = [];

        pToken.split('.').map( (v:string, i:number) => {
            const p = v.indexOf('[]');
            toks.push(new SearchToken({
                iter: (p==v.length-2),
                name: (p>-1? v.substr(0,p) : v )
            }))
        });

        return toks;
    }

    /**
     * To check if the current token is an iterable node
     *
     * @return {boolean} Return TRUE if the associated property should be itered
     * @method
     * @since 1.0.0
     */
    isIterable():boolean {
        return this.iter;
    }

    /**
     * To serialize to a raw object, ready to be serialized to text
     *
     * @return {any} Basic object
     * @method
     * @since 1.0.0
     */
    serialize():any {
        return {
            iter: this.iter,
            name: this.name
        };
    }

}