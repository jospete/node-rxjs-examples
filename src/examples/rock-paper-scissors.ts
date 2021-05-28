import { createInterface } from 'readline';
import { defer, fromEvent, merge, Observable } from 'rxjs';
import { mapTo, takeWhile, tap } from 'rxjs/operators';

import { random } from '../util';
import { assertValueConstraint, repeatInfinite, retryAfterDelay } from './examples-util';

enum GameChoice {
	rock = 'rock',
	paper = 'paper',
	scissors = 'scissors',
	lizard = 'lizard',
	spock = 'spock'
}

interface WinCondition {
	target: GameChoice;
	verb: string;
}

const winConditionMap = new Map<GameChoice, WinCondition[]>()
	.set(GameChoice.scissors, [
		{ target: GameChoice.paper, verb: 'cuts' },
		{ target: GameChoice.lizard, verb: 'decapitates' }
	])
	.set(GameChoice.paper, [
		{ target: GameChoice.rock, verb: 'covers' },
		{ target: GameChoice.spock, verb: 'disproves' }
	])
	.set(GameChoice.rock, [
		{ target: GameChoice.scissors, verb: 'crushes' },
		{ target: GameChoice.lizard, verb: 'crushes' }
	])
	.set(GameChoice.lizard, [
		{ target: GameChoice.spock, verb: 'poisons' },
		{ target: GameChoice.paper, verb: 'eats' }
	])
	.set(GameChoice.spock, [
		{ target: GameChoice.scissors, verb: 'smashes' },
		{ target: GameChoice.rock, verb: 'vaporizes' }
	]);

const quitCommand = 'quit';
const getValidGameInputs = () => Object.values(GameChoice as any).concat([quitCommand]);
const isValidGameInput = (input: string): boolean => getValidGameInputs().includes(input);

const findWinCondition = (a: GameChoice, b: GameChoice): WinCondition | undefined => {
	return winConditionMap.get(a)?.find(v => v.target === b);
};

const winConditionToString = (a: GameChoice, b: GameChoice, condition: WinCondition): string => {
	return a + ' ' + condition.verb + ' ' + b;
};

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

	console.log('------------ GAME ------------');
	console.log('  player choice = ' + playerPick);
	console.log('computer choice = ' + computerPick);

	const playerWinCondition = findWinCondition(playerPick, computerPick);

	if (playerWinCondition) {
		console.log('you won! - ' + winConditionToString(playerPick, computerPick, playerWinCondition));
		return;
	}

	const computerWinCondition = findWinCondition(computerPick, playerPick);

	if (computerWinCondition) {
		console.log('you lose :( - ' + winConditionToString(computerPick, playerPick, computerWinCondition));
		return;
	}

	console.log('draw');
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