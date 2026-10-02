import { strict as assert } from 'node:assert';
import Bus, { BusSubscriber } from '../src/Bus.js';
import BusEvent from '../src/BusEvent.js';

describe('Bus subscription lifecycle', function () {
    it('stops delivery and clears subscription state after unscribeAll', function () {
        const bus = new Bus(null);
        let delivered = 0;
        bus.subscribe('event', BusSubscriber.from(() => { delivered++; }));
        bus.send(new BusEvent({ type: 'event' }));
        bus.unscribeAll('event');
        bus.send(new BusEvent({ type: 'event' }));
        assert.equal(delivered, 1);
        assert.equal(bus.hasSubscriptionsTo('event'), false);
        bus.subscribe('event', BusSubscriber.from(() => { delivered++; }));
        bus.send(new BusEvent({ type: 'event' }));
        assert.equal(delivered, 2);
    });

    it('passes the event to direct and Rx subscriber adapters', function () {
        const event = new BusEvent({ type: 'event' });
        const received = [];
        const subscriber = BusSubscriber.from(value => { received.push(value); });
        subscriber.exec(event);
        subscriber.toRxSubscriber(null)(event);
        assert.deepEqual(received, [event, event]);
    });

    it('returns the bus after subscribing to multiple event names', function () {
        const bus = new Bus(null);
        assert.equal(bus.subscribe(['first', 'second'], BusSubscriber.from(() => {})), bus);
    });
});
