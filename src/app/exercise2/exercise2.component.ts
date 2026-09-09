import { Component, inject, signal } from '@angular/core';
import {CountryService} from './country.service';
import { form, FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-exercise2',
    templateUrl: './exercise2.component.html',
    styleUrls: ['./exercise2.component.css'],
    imports: [RouterLink, FormField]
})
export class Exercise2Component {

  private service = inject(CountryService);

  countries = this.service.countries;

  // Signal Forms model + FieldTree. Bind both <select>s with [formField].
  // Drive states with httpResource whose params depend on the country field (see solution 2).
  countryModel = signal({ countryId: '', stateCode: '' });
  countryForm = form(this.countryModel);

}
