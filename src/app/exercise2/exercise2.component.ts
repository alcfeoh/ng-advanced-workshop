import { Component } from '@angular/core';
import {Observable} from 'rxjs';
import {Country} from './types';
import {CountryService} from './country.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-exercise2',
    templateUrl: './exercise2.component.html',
    styleUrls: ['./exercise2.component.css'],
    imports: [RouterLink, ReactiveFormsModule, AsyncPipe]
})
export class Exercise2Component {

  countries$: Observable<Country[]> = this.service.getCountries();
  countryDropdown = new FormControl<Country['id']>(null);

  constructor(private service: CountryService) { }

}
