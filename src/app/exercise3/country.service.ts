import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import {Country, State} from './types';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  private countries$: Observable<Country[]>;

  constructor(private http: HttpClient) {
    this.countries$ = http.get<Country[]>('http://localhost:3000/countries');
  }

  getCountries(): Observable<Country[]> {
    return this.countries$;
  }

  getStatesFor(countryId: string): Observable<State[]> {
    return this.http.get<State[]>(`http://localhost:3000/states?countryCode=${countryId}`)
      .pipe(
        map(states => states.sort((a, b) => (a.description > b.description) ? 1 : -1))
      );
  }
}
