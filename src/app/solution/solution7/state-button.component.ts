import {Component, HostListener, Input, ChangeDetectionStrategy} from '@angular/core';
import {Observable} from 'rxjs';


type State = 'initial' | 'working' | 'done';

@Component({
    selector: 'app-state-button',
    templateUrl: './state-button.component.html',
    styleUrls: ['./state-button.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: []
})
export class StateButtonComponent<T> {

  @Input()
  action: Observable<T>;

  state: State = 'initial';

  @HostListener('click')
  triggerAction() {
    this.state = 'working';
    this.action.subscribe(() => this.state = 'done');
  }
}
