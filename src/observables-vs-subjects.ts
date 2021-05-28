import { EventEmitter } from 'events';
import { Subject, Observable, fromEvent } from 'rxjs';

import { createTaggedObserver } from './util';

// Subjects are basically EventEmitter instances.

// This flow:
const progressSubject = new Subject<number>();
progressSubject.next(5); // <- does not exist on the Observable class
progressSubject.subscribe(createTaggedObserver('progressSubject'));
progressSubject.next(6);

// Is the same as this flow:
const emitter = new EventEmitter();
emitter.emit('progress', 5);
emitter.on('progress', v => console.log('emitter progress: ', v));
emitter.emit('progress', 6);

// Notice that we do not log the value 5 from the above code.
// This is because, unlike observables, subjects are "hot" by default.
// If nothing is subscribed to them, the value simply falls into the void, never to be seen again.

// Subjects are also observers!

const emitterSource = fromEvent(emitter, 'progress') as Observable<number>;
emitterSource.subscribe(progressSubject);
emitter.emit('progress', 7); // output: "[progressSubject] next: 7"

// emitterSource.next(7); <- we cannot do this because Observables do not have a next() method.
// This can be used to our advantage to control the flow of data, i.e.:

const oneWayOutput = progressSubject.asObservable();

// If we expose only "oneWayOutput" to other classes / modules, we have effectively 
// made the subject's data stream "readonly" - Huzzah for suppressing data corruption!

console.log('typeof oneWayOutput.next = ' + (typeof (oneWayOutput as any).next)); // undefined -> no such method next on class Observable


// Subjects are good "observer sources" for internal application events,
// as long as we only expose their events via the asObservable() method.