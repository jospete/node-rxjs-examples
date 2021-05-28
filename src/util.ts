import { Observer } from 'rxjs';

export const random = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min)) + min;
};

// Useful for dumping observable events
export const createTaggedObserver = <V>(tag: string): Observer<V> => ({
	next: (v: V) => console.log('[' + tag + '] next: ', v),
	error: (e: any) => console.log('[' + tag + '] errror: ', e),
	complete: () => console.log('[' + tag + '] complete'),
});