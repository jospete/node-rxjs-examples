import { lastValueFrom, MonoTypeOperatorFunction, of } from 'rxjs';
import { scan } from 'rxjs/operators';

// Operators are the single most powerful thing that rxjs offers, and what makes it stand out above all other reactive libraries.
// They allow you to warp data streams in a pure, stateless, and consistent way.

// Our custom "aggregate" operator, adds all the values in a stream together.
// Note that this operator function has no idea that "sourceStream" exists - it only takes some
// input stream, mutates the data, and returns a new output stream.
const aggregate = (): MonoTypeOperatorFunction<number> => {

	return source => source.pipe(

		// Operators can use other operators!
		scan((acc: number, v: number) => acc + v, 0)
	);
};

const sourceStream = of(5, 10, 15, 20).pipe(
	aggregate()
);

lastValueFrom(sourceStream).then(v => {
	console.log('aggregated value is: ', v);
});