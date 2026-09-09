import { Component, signal } from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {Observable, of, switchMap} from 'rxjs';
import {Country, State} from './types';
import {CountryService} from './country.service';
import { form, FormField } from '@angular/forms/signals';
import { AsyncPipe, TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-solution2',
    templateUrl: './solution2.component.html',
    styleUrls: ['./solution2.component.css'],
    imports: [FormField, AsyncPipe, TitleCasePipe]
})
export class Solution2Component {

  countries$: Observable<Country[]> = this.service.getCountries();
  states$: Observable<State[]>;
  countryModel = signal({ countryId: '', stateCode: '' });
  countryForm = form(this.countryModel);

  constructor(private service: CountryService) {
    this.states$ = toObservable(this.countryForm.countryId().value).pipe(
      switchMap(countryId => countryId ? service.getStatesFor(countryId) : of([]))
    );
  }
}
