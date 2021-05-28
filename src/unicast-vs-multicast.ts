import { Observable, Subject } from 'rxjs';

import { createTaggedObserver, random } from './util';

// Observables are unicast out-the-box.
// Each subscription gets its own stream.

const unicastExample = new Observable(subscriber => {
	subscriber.next(random(1, 100000));
});

unicastExample.subscribe(createTaggedObserver('unicastSubscriber-1'));
unicastExample.subscribe(createTaggedObserver('unicastSubscriber-2'));

// Subjects are multicast out-the-box.
// Subscriptions share the same event stream.

const multicastExample = new Subject<number>();

multicastExample.subscribe(createTaggedObserver('multicastExample-1'));
multicastExample.subscribe(createTaggedObserver('multicastExample-2'));

for (let i = 0; i < 3; i++) {
	multicastExample.next(random(1, 100000));
}