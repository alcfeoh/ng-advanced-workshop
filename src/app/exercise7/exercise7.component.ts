import { Component, ChangeDetectionStrategy } from '@angular/core';
import {timer} from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-exercise7',
    templateUrl: './exercise7.component.html',
    styleUrls: ['./exercise7.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink]
})
export class Exercise7Component {

  action$ = timer(2000);

}
