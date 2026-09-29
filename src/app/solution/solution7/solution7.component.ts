import { Component } from '@angular/core';
import { timer } from 'rxjs';
import { StateButtonComponent } from './state-button.component';

@Component({
    selector: 'app-solution7',
    templateUrl: './solution7.component.html',
    styleUrls: ['./solution7.component.css'],
    imports: [StateButtonComponent]
})
export class Solution7Component {

  /** Cold demo action: each accepted click emits once after 2 seconds. */
  readonly action$ = timer(2000);

}
