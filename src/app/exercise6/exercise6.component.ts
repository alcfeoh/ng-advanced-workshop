import { Component, ChangeDetectionStrategy } from '@angular/core';
import {timer} from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-exercise6',
    templateUrl: './exercise6.component.html',
    styleUrls: ['./exercise6.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink]
})
export class Exercise6Component  {

  action$ = timer(2000);


}

