import { Component, inject, signal } from '@angular/core';
import {Country, State} from './types';
import {CountryService} from './country.service';
import { form, FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-exercise3',
    templateUrl: './exercise3.component.html',
    styleUrls: ['./exercise3.component.css'],
    imports: [RouterLink, FormField]
})
export class Exercise3Component {

  private service = inject(CountryService);

  // Signal Forms model + FieldTree. Bind the country <input> with [formField].
  // Filter countries with computed() from the field value + countries resource (see solution 3).
  // Drive states with httpResource whose params depend on selectedCountryId.
  countryModel = signal({ country: '' });
  countryForm = form(this.countryModel);

  countries = this.service.countries;

  selectedCountryId = signal('');
  state = signal<State | undefined>(undefined);

  updateStates(country: Country) {
    this.countryForm.country().value.set(country.description);
    this.selectedCountryId.set(country.id);
    this.state.set(undefined);
  }
}
