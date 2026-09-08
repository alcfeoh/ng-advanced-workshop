import { Component } from '@angular/core';
import {Observable} from 'rxjs';
import {Country, State} from './types';
import {CountryService} from './country.service';
import { RouterLink } from '@angular/router';
import { AsyncPipe, TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-exercise3',
    templateUrl: './exercise3.component.html',
    styleUrls: ['./exercise3.component.css'],
    imports: [RouterLink, AsyncPipe, TitleCasePipe]
})
export class Exercise3Component {

  countries$: Observable<Country[]> = this.service.getCountries();
  states$: Observable<State[]>;
  country!: Country;
  state!: State;

  constructor(private service: CountryService) { }

  updateStates(country: Country) {
    this.country = country;
    this.states$ = this.service.getStatesFor(country.id);
  }
}
