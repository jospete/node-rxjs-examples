import { interval, Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';

// NOTE: even though we may declare observables, that does not mean they are "active"
const coldObservable = new Observable(subscriber => {
	console.log('coldObservable constructor'); // this will not happen
	subscriber.next(0);
	subscriber.complete();
});

const coldObservableWithSubscriber = new Observable(subscriber => {
	console.log('coldObservableWithSubscriber constructor'); // but this will
	subscriber.next(0);
	subscriber.complete();
});

// Subscribing to "cold" obervables makes them "hot" (i.e. activates the inner stream)
coldObservableWithSubscriber.subscribe({
	next: v => console.log('coldObservableWithSubscriber next: ', v),
	error: e => console.log('coldObservableWithSubscriber errror: ', e),
	complete: () => console.log('coldObservableWithSubscriber complete'),
});

// Even though we've "defined" the stream, it will not activate (i.e. emit values) until 
// we subscribe in the setTimeout() call below.
const coldInterval = interval(100).pipe(
	tap(v => console.log('coldInterval tap: ', v)),
	take(10)
);

console.log('cold interval START: ' + Date.now());

setTimeout(() => {

	// "coldInterval tap" will not happen before we subscribe
	console.log('cold interval SUBSCRIBE: ' + Date.now());

	coldInterval.subscribe({
		next: v => console.log('coldInterval next: ', v),
		error: e => console.log('coldInterval errror: ', e),
		complete: () => console.log('coldInterval complete'),
	});

}, 1000);