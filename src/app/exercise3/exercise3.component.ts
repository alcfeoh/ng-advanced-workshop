import { Component, computed, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import {Country, State} from './types';
import {CountryService} from './country.service';
import { form, FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-exercise3',
    templateUrl: './exercise3.component.html',
    styleUrls: ['./exercise3.component.css'],
    imports: [RouterLink, FormField, TitleCasePipe]
})
export class Exercise3Component {

  private service = inject(CountryService);

  // Signal Forms model + FieldTree. Bind the country <input> with [formField].
  countryModel = signal({ country: '' });
  countryForm = form(this.countryModel);

  countries = this.service.countries;

  // Filter with computed() from countryForm.country().value() + countries.value() (see solution 3).
  filteredCountries = computed(() => this.countries.value());

  selectedCountryId = signal('');
  state = signal<State | undefined>(undefined);

  // URL/params should depend on selectedCountryId (see solution 3).
  states = httpResource<State[]>(() => undefined, {
    defaultValue: [] as State[],
  });

  updateStates(country: Country) {
    this.countryForm.country().value.set(country.description);
    this.selectedCountryId.set(country.id);
    this.state.set(undefined);
  }
}
