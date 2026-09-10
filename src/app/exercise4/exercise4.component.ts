import { Component, computed, inject, linkedSignal } from '@angular/core';
import {Country, State} from './types';
import {CountryService} from './country.service';
import { form, FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { HighlightPipe } from '../solution/solution3/highlight.pipe';

@Component({
    selector: 'app-exercise4',
    templateUrl: './exercise4.component.html',
    styleUrls: ['./exercise4.component.css'],
    imports: [RouterLink, FormField, TitleCasePipe, HighlightPipe]
})
export class Exercise4Component {

  private service = inject(CountryService);

  // Form text follows the selected country, but typing can still override it to filter.
  countryModel = linkedSignal(() => ({
    country: this.service.selectedCountry()?.description ?? '',
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
    source: () => this.service.selectedCountry(),
    computation: () => undefined as State | undefined,
  });

  // Signal Forms model + FieldTree. Bind the state <input> with [formField].
  // Selecting a state is one write (selectedState). The filter text follows with linkedSignal.
  stateModel = linkedSignal(() => ({
    state: this.selectedState()?.description ?? '',
  }));
  stateForm = form(this.stateModel);

  // Filter with computed() from stateForm.state().value() + states.value() (see solution 4).
  filteredStates = computed(() => this.states.value());

  updateStates(country: Country) {
    this.service.selectedCountry.set(country);
  }

  updateState(state: State) {
    this.selectedState.set(state);
  }
}
