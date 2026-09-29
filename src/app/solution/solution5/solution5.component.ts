import { Component, inject, linkedSignal } from '@angular/core';
import {State} from './types';
import {CountryService} from './country.service';
import { AutofilterDropdownComponent } from './autofilter-dropdown/autofilter-dropdown.component';
import { JsonPipe } from '@angular/common';

@Component({
    selector: 'app-solution5',
    templateUrl: './solution5.component.html',
    styleUrls: ['./solution5.component.css'],
    imports: [AutofilterDropdownComponent, JsonPipe]
})
export class Solution5Component {

  private service = inject(CountryService);

  countries = this.service.countries;
  states = this.service.states;

  // One write: the country dropdown's [(selection)] updates this signal,
  // which is also what the states httpResource reads.
  selectedCountry = this.service.selectedCountry;

  // Reset the chosen state whenever the selected country changes.
  selectedState = linkedSignal({
    source: () => this.selectedCountry(),
    computation: () => undefined as State | undefined,
  });
}
