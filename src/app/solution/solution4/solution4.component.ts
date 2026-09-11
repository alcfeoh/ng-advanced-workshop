import { Component, computed, inject, linkedSignal } from '@angular/core';
import {Country, State} from './types';
import {CountryService} from './country.service';
import { form, FormField } from '@angular/forms/signals';
import { TitleCasePipe } from '@angular/common';
import { HighlightPipe } from '../solution3/highlight.pipe';

@Component({
    selector: 'app-solution4',
    templateUrl: './solution4.component.html',
    styleUrls: ['./solution4.component.css'],
    imports: [FormField, TitleCasePipe, HighlightPipe]
})
export class Solution4Component {

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
    this.service.selectedCountry.set(country);
  }

  updateState(state: State) {
    this.selectedState.set(state);
  }
}
