import { Component, computed, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
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

  filteredCountries = computed(() => {
    const filter = this.countryForm.country().value().toLowerCase();
    return this.countries.value().filter(
      c => c.description.toLowerCase().indexOf(filter) !== -1
    );
  });

  selectedCountryId = signal('');
  state = signal<State | undefined>(undefined);

  states = httpResource<State[]>(
    () => {
      const countryId = this.selectedCountryId();
      return countryId
        ? { url: 'http://localhost:3000/states', params: { countryCode: countryId } }
        : undefined;
    },
    {
      defaultValue: [] as State[],
      parse: (value) =>
        [...(value as State[])].sort((a, b) => (a.description > b.description ? 1 : -1)),
    },
  );

  updateStates(country: Country) {
    this.countryForm.country().value.set(country.description);
    this.selectedCountryId.set(country.id);
    this.state.set(undefined);
  }
}
