import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { form, FormField } from '@angular/forms/signals';

@Component({
    selector: 'app-exercise1',
    templateUrl: './exercise1.component.html',
    styleUrls: ['./exercise1.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, FormField]
})
export class Exercise1Component {

  // Signal Forms model + FieldTree. Load countries from the sample API and bind the <select>.
  countryModel = signal({ countryId: 'US' });
  countryForm = form(this.countryModel);

}
