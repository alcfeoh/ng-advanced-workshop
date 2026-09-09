import { Component, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import {State} from './types';
import {CountryService} from './country.service';
import { form, FormField } from '@angular/forms/signals';
import { TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-solution2',
    templateUrl: './solution2.component.html',
    styleUrls: ['./solution2.component.css'],
    imports: [FormField, TitleCasePipe]
})
export class Solution2Component {

  private service = inject(CountryService);

  countries = this.service.countries;
  countryModel = signal({ countryId: '', stateCode: '' });
  countryForm = form(this.countryModel);

  states = httpResource<State[]>(
    () => {
      const countryId = this.countryForm.countryId().value();
      return countryId
        ? { url: 'http://localhost:3000/states', params: { countryCode: countryId } }
        : undefined;
    },
    {
      defaultValue: [] as State[],
      parse: (value) =>
        [...(value as State[])].sort((a, b) => (a.description > b.description ? 1 : -1)),
    },
  );
}
