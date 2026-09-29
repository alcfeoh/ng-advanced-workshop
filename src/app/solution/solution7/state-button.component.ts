import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { from, isObservable, Observable, take } from 'rxjs';

type ActionPhase = 'idle' | 'working' | 'done';

/**
 * Projects one custom template per phase (idle → working → done).
 * Slots are `[default]`, `[working]`, and `[done]`.
 *
 * A click while the phase is `working` is ignored, so only one subscription
 * is live. After the action emits, another click runs it again.
 */
@Component({
    selector: 'app-state-button',
    host: {
        '(click)': 'triggerAction()',
    },
    templateUrl: './state-button.component.html',
    styleUrls: ['./state-button.component.css'],
    imports: [],
})
export class StateButtonComponent<T> {

  /** Cold Observable or Promise. Started once per accepted click. */
  readonly action = input.required<Observable<T> | Promise<T>>();

  /** Which projected slot is visible. */
  readonly phase = signal<ActionPhase>('idle');

  private readonly destroyRef = inject(DestroyRef);

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
