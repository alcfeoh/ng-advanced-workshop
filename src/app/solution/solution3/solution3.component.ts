import { Component, computed, inject, signal } from '@angular/core';
import {Country, State} from './types';
import {CountryService} from './country.service';
import { form, FormField } from '@angular/forms/signals';
import { TitleCasePipe } from '@angular/common';
import { HighlightPipe } from './highlight.pipe';

@Component({
    selector: 'app-solution3',
    templateUrl: './solution3.component.html',
    styleUrls: ['./solution3.component.css'],
    imports: [FormField, TitleCasePipe, HighlightPipe]
})
export class Solution3Component {

  private service = inject(CountryService);

  countryModel = signal({ country: '' });
  countryForm = form(this.countryModel);

  countries = this.service.countries;
  states = this.service.states;

  filteredCountries = computed(() => {
    const filter = this.countryForm.country().value().toLowerCase();
    return this.countries.value().filter(
      c => c.description.toLowerCase().indexOf(filter) !== -1
    );
  });

  state = signal<State | undefined>(undefined);

  updateStates(country: Country) {
    this.countryForm.country().value.set(country.description);
    this.service.selectedCountryId.set(country.id);
    this.state.set(undefined);
  }
}
