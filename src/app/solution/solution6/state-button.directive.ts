import { computed, DestroyRef, Directive, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { from, isObservable, Observable, take } from 'rxjs';

type ActionPhase = 'idle' | 'working' | 'done';

/**
 * Turns any clickable element into a 3-state trigger (idle → working → done).
 * The `[action][textWhenDone]` selector leaves unconfigured elements alone.
 *
 * A click while the phase is `working` is ignored, so only one subscription
 * is live. After the action emits, another click runs it again.
 */
@Directive({
    selector: '[action][textWhenDone]',
    host: {
        '[textContent]': 'label()',
        '(click)': 'triggerAction()',
    },
})
export class StateButtonDirective<T> {

  /** Cold Observable or Promise. Started once per accepted click. */
  readonly action = input.required<Observable<T> | Promise<T>>();

  readonly textWhenWorking = input('Loading...');
  readonly textWhenDone = input('Done!');
  readonly defaultText = input('Save');

  private readonly phase = signal<ActionPhase>('idle');
  private readonly destroyRef = inject(DestroyRef);

  /** Host label. Follows the phase and stays in sync if a label input changes. */
  readonly label = computed(() => {
    switch (this.phase()) {
      case 'working':
        return this.textWhenWorking();
      case 'done':
        return this.textWhenDone();
      default:
        return this.defaultText();
    }
  });

  triggerAction(): void {
    if (this.phase() === 'working') {
      return;
    }

    this.phase.set('working');

    const action = this.action();
    const source$ = isObservable(action) ? action : from(action);

    // take(1) ends the subscription after the first value. takeUntilDestroyed
    // ends it earlier if the host is destroyed while the action is still in flight.
    source$.pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.phase.set('done'),
      error: () => this.phase.set('idle'),
    });
  }
}
