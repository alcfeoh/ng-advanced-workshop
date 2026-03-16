import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {Country, State} from './types';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {CountryService} from './country.service';
import {map, withLatestFrom} from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, AsyncPipe, TitleCasePipe } from '@angular/common';
import { HighlightPipe } from '../solution/solution3/highlight.pipe';

@Component({
    selector: 'app-exercise4',
    templateUrl: './exercise4.component.html',
    styleUrls: ['./exercise4.component.css'],
    imports: [RouterLink, ReactiveFormsModule, NgIf, NgFor, AsyncPipe, TitleCasePipe, HighlightPipe]
})
export class Exercise4Component {

  countries$: Observable<Country[]>;
  states$!: Observable<State[]>;
  state!: State;
  countryControl = new FormControl<string>('');

  constructor(private service: CountryService) {
    this.countries$ = this.countryControl.valueChanges.pipe(
      withLatestFrom(this.service.getCountries()),
      map(([userInput, countries]) =>
        countries.filter(c => c.description.toLowerCase().indexOf((userInput ?? "").toLowerCase()) !== -1))
    );
  }

  updateStates(country: Country) {
    this.countryControl.setValue(country.description);
    this.states$ = this.service.getStatesFor(country.id);
  }
}
