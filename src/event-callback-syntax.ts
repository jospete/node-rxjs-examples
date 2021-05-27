import { EventEmitter } from 'events';

import { random } from './util';

// Vanilla event handler from NodeJS
const emitter = new EventEmitter();

// Keep track of progress outside of handler so we can reference it elsewhere
let progress = 0;
let intervalId: any = null;

// Handles 'progress' events emitted by the emitter instance
const handleProgressUpdate = (value: number) => {

	progress += value;
	console.log('[EVENT] progress - ' + value + ' -> ' + progress);

	if (progress >= 100) {

		console.log('handleProgressUpdate() complete! -> ' + progress);
		progress = 100;

		// We will continue to recive progress events util we manually remove the handler callback
		emitter.removeListener('progress', handleProgressUpdate);
		emitter.emit('complete');
	}
};

// Register the progress handler
emitter.on('progress', handleProgressUpdate);

// Intercept a single 'complete' event - the handler will un-register itself after one emission.
emitter.once('complete', () => {
	console.log('[EVENT] complete - ' + progress);
	clearInterval(intervalId);
});

// Source for triggering event emissions.
// Needs to be turned off manually via clearInterval() later.
// Notice we are defining the source last... and the "operator" mechanisms need to be ordered in reverse.
intervalId = setInterval(() => {
	const nextProgress = random(1, 10);
	console.log('nextProgress = ' + nextProgress);
	emitter.emit('progress', nextProgress);
}, 300);