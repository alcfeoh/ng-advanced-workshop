import { Component } from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {Country, State} from './types';
import {CountryService} from './country.service';
import {switchMap} from 'rxjs/operators';
import { AutofilterDropdownComponent } from './autofilter-dropdown/autofilter-dropdown.component';
import { JsonPipe } from '@angular/common';

@Component({
    selector: 'app-solution5',
    templateUrl: './solution5.component.html',
    styleUrls: ['./solution5.component.css'],
    imports: [AutofilterDropdownComponent, JsonPipe]
})
export class Solution5Component {

  countries$: Observable<Country[]>;
  currentCountry$ = new Subject<Country>();
  statesForCountry$: Observable<State[]> =  of([]);
  country: Country;
  state: State;

  constructor(private service: CountryService) {
    this.countries$ = this.service.getCountries();
    this.statesForCountry$ = this.currentCountry$.asObservable().pipe(
      switchMap(cntry => this.service.getStatesFor(cntry.id))
    );
  }

  updateStates(country: Country) {
    this.country = country;
    this.state = null;
    this.currentCountry$.next(country);
  }

}
