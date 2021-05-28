import { Observable, Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { createTaggedObserver, random } from './util';

// Observables are unicast out-the-box.
// Each subscription gets its own stream.

const unicastExample = new Observable(subscriber => {
	subscriber.next(random(1, 100000));
	setTimeout(() => subscriber.next(random(1, 100000)), 500);
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

// Observables can be turned into multicast streams via the share() operator

const unicastAsMulticastExample = unicastExample.pipe(share());

unicastAsMulticastExample.subscribe(createTaggedObserver('unicastAsMulticastExample-1'));

// This stream will not get the value, because it's already been provided to the 1st subscription.
// However, it WILL get the 2nd value from the setTimeout() call because both 1 & 2 will be subscribed at that point.
unicastAsMulticastExample.subscribe(createTaggedObserver('unicastAsMulticastExample-2'));