import { Component, computed, inject, linkedSignal } from '@angular/core';
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
  // Selecting a country is one write (selectedCountry). selectedCountryId is computed in the service.
  countryModel = linkedSignal(() => ({
    country: this.service.selectedCountry()?.description ?? '',
  }));
  countryForm = form(this.countryModel);

  countries = this.service.countries;
  states = this.service.states;

  // Filter with computed() from countryForm.country().value() + countries.value() (see solution 3).
  filteredCountries = computed(() => this.countries.value());

  // Reset the chosen state whenever the selected country changes (see solution 3).
  state = linkedSignal({
    source: () => this.service.selectedCountry(),
    computation: () => undefined as State | undefined,
  });

  updateStates(country: Country) {
    this.service.selectedCountry.set(country);
  }
}
