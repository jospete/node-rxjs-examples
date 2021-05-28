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

const quitCommand = 'quit';
const getValidGameInputs = () => Object.values(GameChoice as any).concat([quitCommand]);
const isValidGameInput = (input: string): boolean => getValidGameInputs().includes(input);

const winConditionMap = new Map<GameChoice, GameChoice>()
	.set(GameChoice.rock, GameChoice.scissors)
	.set(GameChoice.scissors, GameChoice.paper)
	.set(GameChoice.paper, GameChoice.rock);

const pickRandomChoice = (): GameChoice => {
	const choices = [
		GameChoice.rock,
		GameChoice.paper,
		GameChoice.scissors
	];
	return choices[random(0, choices.length)];
};

const playGame = (playerPick: GameChoice): void => {

	const computerPick = pickRandomChoice();
	console.log('player chose ' + playerPick);
	console.log('computer chose ' + computerPick);

	if (winConditionMap.get(playerPick) === computerPick) {
		console.log('you won!');
		return;
	}

	if (winConditionMap.get(computerPick) === playerPick) {
		console.log('you lose :(');
		return;
	}

	console.log('tie');
};

const rl = createInterface({
	input: process.stdin,
	output: process.stdout
});

// Helper for turning readline function into a promise
const ask = (question: string): Promise<string> => new Promise(resolve => rl.question(question, resolve));

const errors = merge(
	fromEvent(rl, 'pause').pipe(mapTo('PAUSED')),
	fromEvent(rl, 'close').pipe(mapTo('CLOSED'))
).pipe(
	tap(v => {
		throw new Error(v);
	})
);

const requestGameChoice: Observable<string> = defer(() => ask('options = ' + JSON.stringify(getValidGameInputs()) + ': ')).pipe(
	assertValueConstraint(isValidGameInput, v => 'invalid choice "' + v + '"'),
	retryAfterDelay(250)
);

const source = merge(
	errors,
	repeatInfinite(() => requestGameChoice)
).pipe(
	takeWhile(v => v !== quitCommand),
	tap(v => playGame(v as any))
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