import { Injectable, computed, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import {Country, State} from './types';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  selectedCountry = signal<Country | undefined>(undefined);
  selectedCountryId = computed(() => this.selectedCountry()?.id ?? '');

  countries = httpResource<Country[]>(() => 'http://localhost:3000/countries', {
    defaultValue: [] as Country[],
  });

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
}
