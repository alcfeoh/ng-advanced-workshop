import { Component, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {Observable} from 'rxjs';
import {Country, State} from './types';
import {CountryService} from './country.service';
import { form, FormField } from '@angular/forms/signals';
import {map, withLatestFrom} from 'rxjs/operators';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { HighlightPipe } from './highlight.pipe';

@Component({
    selector: 'app-solution3',
    templateUrl: './solution3.component.html',
    styleUrls: ['./solution3.component.css'],
    imports: [FormField, AsyncPipe, TitleCasePipe, HighlightPipe]
})
export class Solution3Component {

  private service = inject(CountryService);

  countryModel = signal({ country: '' });
  countryForm = form(this.countryModel);

  // toObservable bridges the Signal Form field into RxJS so withLatestFrom can
  // combine keystrokes with the countries HTTP stream (same lesson as valueChanges).
  countries$: Observable<Country[]> = toObservable(this.countryForm.country().value).pipe(
    withLatestFrom(this.service.getCountries()),
    map(([userInput, countries]) =>
      countries.filter(c => c.description.toLowerCase().indexOf(userInput.toLowerCase()) !== -1)
    )
  );
  states$: Observable<State[]>;
  state: State;

  updateStates(country: Country) {
    this.countryForm.country().value.set(country.description);
    this.states$ = this.service.getStatesFor(country.id);
  }
}
