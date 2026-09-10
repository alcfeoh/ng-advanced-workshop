import { Component, computed, inject, linkedSignal } from '@angular/core';
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

  // Form text follows the selected country, but typing can still override it to filter.
  countryModel = linkedSignal(() => ({
    country: this.service.selectedCountry()?.description ?? '',
  }));
  countryForm = form(this.countryModel);

  countries = this.service.countries;
  states = this.service.states;

  filteredCountries = computed(() => {
    const filter = this.countryForm.country().value().toLowerCase();
    return this.countries.value().filter(
      c => c.description.toLowerCase().indexOf(filter) !== -1
    );
  });

  // Reset the chosen state whenever the selected country changes.
  state = linkedSignal({
    source: () => this.service.selectedCountry(),
    computation: () => undefined as State | undefined,
  });

  updateStates(country: Country) {
    this.service.selectedCountry.set(country);
  }
}
