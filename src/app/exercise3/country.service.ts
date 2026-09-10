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

  // States httpResource whose URL/params depend on selectedCountryId (see solution 3).
  states = httpResource<State[]>(() => undefined, {
    defaultValue: [] as State[],
  });
}
