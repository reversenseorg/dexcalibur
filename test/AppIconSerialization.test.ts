import {expect} from 'chai';
import {AppIconFormat} from '../src/AppIcon.js';
import {AppIconData} from '../src/graphics/common/AppIconData.js';
import {AppIconVectorized} from '../src/graphics/common/AppIconVectorized.js';

describe('AppIcon subclass serialization', () => {
    it('serializes binary data repeatedly without mutating the source', () => {
        const icon = new AppIconData(AppIconFormat.PNG);
        const data = Buffer.from([0, 127, 255]);
        icon.setData(data);
        icon.appPath = 'icon.png';
        for(let i=0;i<2;i++) {
            const result = icon.toJsonObject();
            expect(result.data).to.equal(data.toString('base64'));
            expect(result.appPath).to.equal('icon.png');
            expect(result.fmt).to.equal(AppIconFormat.PNG);
            expect(result).not.to.equal(icon);
        }
        expect(icon.data).to.equal(data);
    });
    it('serializes vector components without recursion', () => {
        const icon = new AppIconVectorized();
        const components = [{type: 'path', attr: {fill: '#fff'}}];
        icon.setData(components);
        const result = icon.toJsonObject();
        expect(result.data).to.equal(components);
        expect(result.fmt).to.equal(AppIconFormat.VECTOR);
        expect(result).not.to.equal(icon);
    });
});
