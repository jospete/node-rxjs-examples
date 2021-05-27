import { emitKeypressEvents } from 'readline';

const inputStream = process.stdin;

emitKeypressEvents(inputStream);
inputStream.setRawMode(true);

inputStream.on('keypress', (str: string, metadata: any) => {
	console.log('keypress event values: ', str, metadata);
	if (metadata.name === 'c' && metadata.ctrl) {
		console.log('received process exit event');
		process.exit(0);
	}
});