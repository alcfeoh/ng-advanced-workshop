import { Component, ChangeDetectionStrategy } from '@angular/core';
import {timer} from 'rxjs';
import { StateButtonComponent } from './state-button.component';

@Component({
    selector: 'app-solution7',
    templateUrl: './solution7.component.html',
    styleUrls: ['./solution7.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [StateButtonComponent]
})
export class Solution7Component {

  action$ = timer(2000);

}
