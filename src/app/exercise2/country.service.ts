import { Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import {Country} from './types';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  countries = httpResource<Country[]>(() => 'http://localhost:3000/countries', {
    defaultValue: [] as Country[],
  });
}
