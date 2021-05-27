import { interval, lastValueFrom } from 'rxjs';
import { map, scan, takeWhile, tap } from 'rxjs/operators';

import { random } from './util';

// Source - a COLD observable that can be activated via subscription.
// We use pipe() to mutate the stream as needed with operators.

const source = interval(300).pipe(                     // interval [creator] - creates source stream that emits every X milliseconds
	map(() => random(1, 10)),                          // map [operator] - take all values from source stream, map values to output stream
	tap(v => console.log('source random = ' + v)),     // tap [operator] - perform side-effects on stream emissions
	scan((acc, v) => (acc + v), 0),                    // scan [operator] - combine emitted values with accumulator state (behavior matches Array.reduce())
	tap(v => console.log('source progress = ' + v)),
	takeWhile(v => v < 100)                            // takeWhile [terminator] - terminates stream the source stream when a value meets the given condition
);

// Subscription - activates the source stream (source goes from COLD to HOT)
// No removeListener() calls, no variable context dragging, no manual "completion" tracking, no event string duplication
source.subscribe({
	next: value => console.log('subscribe val: ' + value),
	complete: () => console.log('subscribe complete!')
});

// Watches the values emitted from source.
// NOTE: this only works because we've first subscribed to the source in the above subscribe() call.
// NOTE: toPromise() has been deprecated in rxjs 7+
lastValueFrom(source).then(v => {
	console.log('last value was: ' + v);
});