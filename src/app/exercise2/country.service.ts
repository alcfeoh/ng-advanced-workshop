import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import {Country} from './types';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  private http = inject(HttpClient);
  private countries$ = this.http.get<Country[]>('http://localhost:3000/countries');

  getCountries(): Observable<Country[]> {
    return this.countries$;
  }
}
