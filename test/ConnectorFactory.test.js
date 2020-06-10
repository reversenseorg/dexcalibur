
const expect = require('chai').expect;


// -- App specific --

const TestHelper = require('../src/TestHelper.js');
const ConnectorFactory = require('../src/ConnectorFactory');
const InMemoryConnector = require('../connectors/inmemory/adapter');

describe('ConnectorFactory', function() {



    let PROJECT = null;

    before(function(){
        PROJECT = TestHelper.getDexcaliburProject();
    })

    describe('constructor', function() {

        it('new instance', function () {

            let factory = new ConnectorFactory();

            expect(factory).to.be.an.instanceOf(ConnectorFactory);
            expect(factory.connectors).to.have.property('inmemory');
        });

    });

    describe('getInstance()', function() {

        it('not force', function () {

            let factory1 = ConnectorFactory.getInstance();
            let factory2;

            expect(factory1).to.be.an.instanceOf(ConnectorFactory);

            factory1.flag = true;
            factory2 = ConnectorFactory.getInstance();

            expect(factory2).to.be.an.instanceOf(ConnectorFactory);
            expect(factory2).to.have.property('flag');
            expect(factory2.flag).to.be.equal(true);
        });

        it('force', function () {

            let factory1 = ConnectorFactory.getInstance();
            let factory2;

            expect(factory1).to.be.an.instanceOf(ConnectorFactory);

            factory1.flag = true;
            factory2 = ConnectorFactory.getInstance(true);

            expect(factory2).to.be.an.instanceOf(ConnectorFactory);
            expect(factory2).to.have.not.property('flag');
        });
    });

    describe('newConnector()', function() {

        it('inmemory connector', function () {
            let factory1 = ConnectorFactory.getInstance();
            let connector;

            connector = factory1.newConnector('inmemory', PROJECT);

            expect(connector).to.an.instanceOf(InMemoryConnector);
            //expect(connector.getContext().get).to.an.instanceOf(InMemoryConnector);
        });
    });
});