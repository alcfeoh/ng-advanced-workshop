import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import {CountryService} from './country.service';
import {Observable} from 'rxjs';
import {Country} from './types';
import { form, FormField } from '@angular/forms/signals';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-solution1',
    templateUrl: './solution1.component.html',
    styleUrls: ['./solution1.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, AsyncPipe]
})
export class Solution1Component {

  countries$: Observable<Country[]> = this.service.getCountries();
  countryModel = signal({ countryId: '' });
  countryForm = form(this.countryModel);

  constructor(private service: CountryService) { }

}
