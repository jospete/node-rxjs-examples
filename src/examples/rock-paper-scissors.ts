import { createInterface } from 'readline';
import { defer, fromEvent, merge, Observable } from 'rxjs';
import { mapTo, takeWhile, tap } from 'rxjs/operators';

import { random } from '../util';
import { assertValueConstraint, repeatInfinite, retryAfterDelay } from './examples-util';

enum GameChoice {
	rock = 'rock',
	paper = 'paper',
	scissors = 'scissors'
}

const pickRandomChoice = (): GameChoice => {
	const choices = [
		GameChoice.rock,
		GameChoice.paper,
		GameChoice.scissors
	];
	return choices[random(0, choices.length)];
};

const winConditionMap = new Map<GameChoice, GameChoice>()
	.set(GameChoice.rock, GameChoice.scissors)
	.set(GameChoice.scissors, GameChoice.paper)
	.set(GameChoice.paper, GameChoice.rock);

// Returns -1 if "a" wins
// Returns 1 if "b" wins
// Returns 0 on draw
const compareGameChoice = (a: GameChoice, b: GameChoice): number => {
	if (winConditionMap.get(a) == b) return -1;
	if (winConditionMap.get(b) == a) return 1;
	return 0;
};

const playGame = (playerInput: string): void => {

	const computerPick = pickRandomChoice();
	console.log('player chose ' + playerInput);
	console.log('computer chose ' + computerPick);

	const result = compareGameChoice(playerInput as any, computerPick);

	switch (result) {
		case -1:
			console.log('you won!');
			break;
		case 1:
			console.log('you lose :(');
			break;
		default:
			console.log('tie');
			break;
	}
};

const isValidGameChoice = (input: string): boolean => {
	return input === 'quit' || Object.values(GameChoice).includes(input as any);
};

const rl = createInterface({
	input: process.stdin,
	output: process.stdout
});

// Helper for turning readline function into a promise
const ask = (question: string): Promise<string> => new Promise(resolve => rl.question(question, resolve));

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
const requestGameChoice: Observable<string> = defer(() => ask('options = ["rock", "paper", "scissors", "quit"]: ')).pipe(
	assertValueConstraint(isValidGameChoice, v => 'invalid choice "' + v + '"'),
	retryAfterDelay(250)
);

// Our source will be the "happy path" flow combined with possible errors that can occur.
// The stream and all its corresponding callbacks are guaranteed to be cleaned up automatically when
// the stream terminates (i.e. "complete" or "error" conditions are met).
const source = merge(
	errors,
	repeatInfinite(() => requestGameChoice)
).pipe(
	takeWhile(v => v !== 'quit'),
	tap(v => playGame(v))
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