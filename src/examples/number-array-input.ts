import { createInterface } from 'readline';
import { defer, fromEvent, merge, of } from 'rxjs';
import { bufferCount, delay, expand, map, mapTo, retryWhen, skip, take, tap } from 'rxjs/operators';

const rl = createInterface({
	input: process.stdin,
	output: process.stdout
});

// Helper for turning readline function into a promise
const ask = (question: string): Promise<string> => {
	return new Promise(resolve => rl.question(question, resolve));
};

// Save events as references instead of strings
const pause = fromEvent(rl, 'pause');
const close = fromEvent(rl, 'close');

// If either pause or close get called, consider them an error
const errors = merge(
	pause.pipe(mapTo('PAUSED')),
	close.pipe(mapTo('CLOSED'))
).pipe(
	tap(v => {
		throw new Error(v);
	})
);

// 1. Ask user to input a number
const requestNumber = defer(() => ask('enter a number: ')).pipe(

	// 2. Try to parse the string as a number - blow up when its not a number
	map(v => {
		const intVal = parseInt(v, 10);
		if (isNaN(intVal)) throw new Error('Not a number - ' + v);
		return intVal;
	}),

	// 3. Catch any explosions that happen in the previous operator,
	// and allow this stream to retry after 1/2 a second.
	retryWhen(inputErrors => inputErrors.pipe(
		tap(v => console.log('error: ' + v)),
		delay(500)
	))
);

// Core Flow
// Request 3 numbers from the user
const coreFlow = of(null).pipe(

	// Run the request process repeatedly until the stream gets terminated
	expand(() => requestNumber),

	// Skip the seed value we start with in of()
	skip(1)
);

// Our source will be the "happy path" flow combined with possible errors that can occur.
// The stream and all its corresponding callbacks are guaranteed to be cleaned up automatically when
// the stream terminates (i.e. "complete" or "error" conditions are met).
const source = merge(
	errors,
	coreFlow
).pipe(
	bufferCount(3),
	take(1)
);

source.subscribe({
	next: v => {
		console.log('subscription next: ', v);
	},
	complete: () => {
		console.log('subscription complete!');
		process.exit(0);
	},
	error: e => {
		console.log('subscription error: ', e);
		process.exit(1);
	}
});