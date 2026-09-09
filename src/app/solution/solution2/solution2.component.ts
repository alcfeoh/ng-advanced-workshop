import { Component, effect, inject, signal } from '@angular/core';
import {Observable} from 'rxjs';
import {Country, State} from './types';
import {CountryService} from './country.service';
import { form, FormField } from '@angular/forms/signals';
import { AsyncPipe, TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-solution2',
    templateUrl: './solution2.component.html',
    styleUrls: ['./solution2.component.css'],
    imports: [FormField, AsyncPipe, TitleCasePipe]
})
export class Solution2Component {

  private service = inject(CountryService);

  countries$: Observable<Country[]> = this.service.getCountries();
  states = signal<State[]>([]);
  countryModel = signal({ countryId: '', stateCode: '' });
  countryForm = form(this.countryModel);

  constructor() {
    effect((onCleanup) => {
      const countryId = this.countryForm.countryId().value();
      if (!countryId) {
        this.states.set([]);
        return;
      }
      const sub = this.service.getStatesFor(countryId).subscribe(list => this.states.set(list));
      onCleanup(() => sub.unsubscribe());
    });
  }
}
