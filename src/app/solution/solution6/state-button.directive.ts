import {Directive, HostBinding, HostListener, Input} from '@angular/core';
import {Observable} from 'rxjs';

@Directive({ selector: '[action][textWhenDone]' })
export class StateButtonDirective<T> {

  @Input()
  action: Observable<T>;

  @Input()
  textWhenWorking = 'Loading...';

  @Input()
  textWhenDone = 'Done!';

  @Input('defaultText')
  @HostBinding('textContent')
  buttonText = 'Save';

  @HostListener('click')
  triggerAction() {
    this.buttonText = this.textWhenWorking;
    this.action.subscribe(() => this.buttonText = this.textWhenDone);
  }
}
