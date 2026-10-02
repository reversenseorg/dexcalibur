import {expect} from 'chai';
import {ProjectInput, ProjectInputViewer, ProjectInputPurpose, ProjectInputLocation, ProjectInputType} from '../src/analyzer/ProjectInput.js';

describe('ProjectInputViewer', () => {
    it('prints every input in order and keeps empty lists empty', () => {
        const inputs = ['first.apk', 'second.apk'].map(data => new ProjectInput({
            data, purpose: ProjectInputPurpose.MAIN, location: ProjectInputLocation.LOCAL,
            type: ProjectInputType.REGULAR_FILE
        }));
        expect(ProjectInputViewer.printList([])).to.equal('');
        expect(ProjectInputViewer.printList(inputs)).to.equal(inputs.map(x => '\n' + ProjectInputViewer.print(x)).join(''));
    });
});
