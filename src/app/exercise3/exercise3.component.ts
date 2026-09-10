import { Component, inject, signal } from '@angular/core';
import {Observable} from 'rxjs';
import {Country, State} from './types';
import {CountryService} from './country.service';
import { form, FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { AsyncPipe, TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-exercise3',
    templateUrl: './exercise3.component.html',
    styleUrls: ['./exercise3.component.css'],
    imports: [RouterLink, FormField, AsyncPipe, TitleCasePipe]
})
export class Exercise3Component {

  private service = inject(CountryService);

  // Signal Forms model + FieldTree. Bind the country <input> with [formField].
  // Bridge the field to RxJS with toObservable so you can withLatestFrom the countries stream.
  countryModel = signal({ country: '' });
  countryForm = form(this.countryModel);

  countries$: Observable<Country[]> = this.service.getCountries();
  states$: Observable<State[]>;
  state!: State;

  updateStates(country: Country) {
    this.countryForm.country().value.set(country.description);
    this.states$ = this.service.getStatesFor(country.id);
  }
}
