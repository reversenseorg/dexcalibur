export enum ImageFormat {
    PNG,
    JPG,
    WEBP,
    NONE
}


export class ImageFormatHelper {

    /**
     * from file extension
      * @param pName
     */
    static fromFileName(pName:string):ImageFormat{
        if(pName==null || pName.indexOf('.')==-1) return ImageFormat.NONE;

        const ext = pName.substring(pName.lastIndexOf('.')+1);

        if(/^png$/i.test(ext)){
            return ImageFormat.PNG;
        }else if(/^(jpg|jpeg)$/i.test(ext)){
            return ImageFormat.JPG;
        }else if(/^webp$/i.test(ext)){
            return ImageFormat.WEBP;
        }else {

        }
    }
}
