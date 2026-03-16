import { Component } from '@angular/core';
import {CountryService} from './country.service';
import {Observable} from 'rxjs';
import {Country} from './types';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-solution1',
    templateUrl: './solution1.component.html',
    styleUrls: ['./solution1.component.css'],
    imports: [NgIf, ReactiveFormsModule, NgFor, AsyncPipe]
})
export class Solution1Component {

  countries$: Observable<Country[]> = this.service.getCountries();
  countryDropdown = new FormControl<Country['id']>(null);

  constructor(private service: CountryService) { }

}
