import { Component, signal } from '@angular/core';
import {Observable} from 'rxjs';
import {Country} from './types';
import {CountryService} from './country.service';
import { form, FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-exercise2',
    templateUrl: './exercise2.component.html',
    styleUrls: ['./exercise2.component.css'],
    imports: [RouterLink, FormField, AsyncPipe]
})
export class Exercise2Component {

  countries$: Observable<Country[]> = this.service.getCountries();

  // Signal Forms model + FieldTree. Bind both <select>s with [formField].
  // Drive states from the country field with RxJS switchMap (see solution 2).
  countryModel = signal({ countryId: '', stateCode: '' });
  countryForm = form(this.countryModel);

  constructor(private service: CountryService) { }

}
