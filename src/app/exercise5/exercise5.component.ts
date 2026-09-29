import { Component, computed, inject, linkedSignal } from '@angular/core';
import {Country, State} from './types';
import {CountryService} from './country.service';
import { form, FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { HighlightPipe } from '../solution/solution3/highlight.pipe';

@Component({
    selector: 'app-exercise5',
    templateUrl: './exercise5.component.html',
    styleUrls: ['./exercise5.component.css'],
    imports: [RouterLink, FormField, TitleCasePipe, HighlightPipe]
})
export class Exercise5Component {

  private service = inject(CountryService);

  // These two dropdowns repeat the same Signal Form + computed() filter.
  // Extract them into one reusable component with [(selection)] two-way binding
  // (model(), or input() + an output named selectionChange). See solution 5.
  // Do not use FormControl, combineLatest, Subject, or the async pipe.

  selectedCountry = this.service.selectedCountry;

  // Form text follows the selected country, but typing can still override it to filter.
  countryModel = linkedSignal(() => ({
    country: this.selectedCountry()?.description ?? '',
  }));
  countryForm = form(this.countryModel);

  countries = this.service.countries;
  states = this.service.states;

  filteredCountries = computed(() => {
    const filter = this.countryForm.country().value().toLowerCase();
    return this.countries.value().filter(
      c => c.description.toLowerCase().indexOf(filter) !== -1
    );
  });

  // Reset the chosen state whenever the selected country changes.
  selectedState = linkedSignal({
    source: () => this.selectedCountry(),
    computation: (): State | undefined => undefined,
  });

  // Form text follows the selected state, but typing can still override it to filter.
  stateModel = linkedSignal(() => ({
    state: this.selectedState()?.description ?? '',
  }));
  stateForm = form(this.stateModel);

  filteredStates = computed(() => {
    const filter = this.stateForm.state().value().toLowerCase();
    return this.states.value().filter(
      s => s.description.toLowerCase().indexOf(filter) !== -1
    );
  });

  updateStates(country: Country) {
    this.selectedCountry.set(country);
  }

  updateState(state: State) {
    this.selectedState.set(state);
  }
}
