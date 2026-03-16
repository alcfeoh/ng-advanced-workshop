import { Component } from '@angular/core';
import {combineLatest, Observable, of, Subject} from 'rxjs';
import {Country, State} from './types';
import {CountryService} from './country.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {map, switchMap} from 'rxjs/operators';
import { NgFor, AsyncPipe, TitleCasePipe } from '@angular/common';
import { HighlightPipe } from '../solution3/highlight.pipe';

@Component({
    selector: 'app-solution3',
    templateUrl: './solution4.component.html',
    styleUrls: ['./solution4.component.css'],
    imports: [ReactiveFormsModule, NgFor, AsyncPipe, TitleCasePipe, HighlightPipe]
})
export class Solution4Component {

  countries$: Observable<Country[]>;
  currentCountry$ = new Subject<Country>();
  states$: Observable<State[]>;
  statesForCountry$: Observable<State[]> =  of([]);
  state: State;
  countryControl = new FormControl('');
  stateControl = new FormControl('');

  constructor(private service: CountryService) {
    this.countries$ = combineLatest([this.countryControl.valueChanges, this.service.getCountries()]).pipe(
      map(([userInput, countries]) => countries.filter(c => c.description.toLowerCase().indexOf(userInput.toLowerCase()) !== -1))
    );
    this.statesForCountry$ = this.currentCountry$.asObservable().pipe(
      switchMap(cntry => this.service.getStatesFor(cntry.id))
    );
    this.states$ = combineLatest([this.stateControl.valueChanges, this.statesForCountry$]).pipe(
      map(([userInput, states]) => states.filter(c => c.description.toLowerCase().indexOf(userInput.toLowerCase()) !== -1))
    );
  }

  updateStates(country: Country) {
    this.countryControl.setValue(country.description);
    this.stateControl.setValue('');
    this.currentCountry$.next(country);
  }
}
