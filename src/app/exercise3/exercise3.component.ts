import { Component, computed, inject, signal } from '@angular/core';
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
  states = this.service.states;

  // Filter with computed() from countryForm.country().value() + countries.value() (see solution 3).
  filteredCountries = computed(() => this.countries.value());

  state = signal<State | undefined>(undefined);

  updateStates(country: Country) {
    this.countryForm.country().value.set(country.description);
    this.service.selectedCountryId.set(country.id);
    this.state.set(undefined);
  }
}
