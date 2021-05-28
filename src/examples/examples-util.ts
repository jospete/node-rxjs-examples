import { MonoTypeOperatorFunction, Observable, of } from 'rxjs';
import { delay, expand, map, retryWhen, skip, tap } from 'rxjs/operators';

export const repeatInfinite = <T>(factory: () => Observable<T>) => of(null).pipe(
	expand(factory),
	skip(1)
);

export const retryAfterDelay = <T>(delayMs: number) => retryWhen<T>(inputErrors => inputErrors.pipe(
	tap(v => console.log('error: ' + v)),
	delay(delayMs)
));

export const assertValueConstraint = <T>(
	constraint: (value: T) => boolean,
	createErrorMessage: (value: T) => string
): MonoTypeOperatorFunction<T> => source => source.pipe(
	map(v => {
		if (!constraint(v)) throw new Error(createErrorMessage(v));
		return v;
	})
);