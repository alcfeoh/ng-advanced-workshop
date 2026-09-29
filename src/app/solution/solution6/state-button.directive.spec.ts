import { Component, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';

import { StateButtonDirective } from './state-button.directive';

@Component({
    selector: 'app-state-button-harness',
    imports: [StateButtonDirective],
    template: `
      <button
        id="save"
        type="button"
        [action]="action"
        [defaultText]="defaultText"
        [textWhenWorking]="textWhenWorking"
        [textWhenDone]="textWhenDone"
      ></button>
      <a
        id="link"
        href="#"
        [action]="action"
        defaultText="Save from a link"
        textWhenWorking="Saving..."
        textWhenDone="Saved!"
      ></a>
      <button id="defaults" type="button" [action]="action" textWhenDone="Finished"></button>
      <button id="plain" type="button">Untouched</button>
    `,
})
class StateButtonHarnessComponent {
  action: Observable<unknown> | Promise<unknown> = new Subject<unknown>();
  defaultText = 'Save';
  textWhenWorking = 'Saving...';
  textWhenDone = 'Saved!';
}

function trackSubscriptions<T>(source: Observable<T>): { tracked$: Observable<T>; active: () => number } {
  let active = 0;
  const tracked$ = new Observable<T>((subscriber) => {
    active++;
    const subscription = source.subscribe(subscriber);
    return () => {
      active--;
      subscription.unsubscribe();
    };
  });
  return { tracked$, active: () => active };
}

describe('StateButtonDirective', () => {
  let fixture: ComponentFixture<StateButtonHarnessComponent>;
  let harness: StateButtonHarnessComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StateButtonHarnessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StateButtonHarnessComponent);
    harness = fixture.componentInstance;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  function element(selector: string): HTMLElement {
    const found: HTMLElement | null = fixture.nativeElement.querySelector(selector);
    if (!found) {
      throw new Error(`missing ${selector}`);
    }
    return found;
  }

  function click(selector: string): void {
    const host = fixture.debugElement.query(By.css(selector));
    if (!host) {
      throw new Error(`missing ${selector}`);
    }
    const el: HTMLElement = host.nativeElement;
    el.addEventListener('click', (event) => event.preventDefault());
    el.click();
    fixture.detectChanges();
  }

  it('shows the idle label on a button and a link, and follows defaultText', () => {
    fixture.detectChanges();

    expect(element('#save').textContent).toBe('Save');
    expect(element('#link').textContent).toBe('Save from a link');

    harness.defaultText = 'Store';
    fixture.detectChanges();

    expect(element('#save').textContent).toBe('Store');
    expect(element('#link').textContent).toBe('Save from a link');
  });

  it('uses the built-in idle and working labels when those inputs are omitted', () => {
    const subject = new Subject<unknown>();
    harness.action = subject;
    fixture.detectChanges();

    const defaults = element('#defaults');
    expect(defaults.textContent).toBe('Save');

    click('#defaults');
    expect(defaults.textContent).toBe('Loading...');

    subject.next(0);
    fixture.detectChanges();
    expect(defaults.textContent).toBe('Finished');
  });

  it('does not attach to a clickable element that lacks the attribute selector', () => {
    fixture.detectChanges();

    click('#plain');

    expect(element('#plain').textContent).toBe('Untouched');
    expect(element('#save').textContent).toBe('Save');
  });

  it('switches to the working label on click and the done label when the action emits', () => {
    const subject = new Subject<string>();
    harness.action = subject;
    fixture.detectChanges();

    click('#save');
    expect(element('#save').textContent).toBe('Saving...');
    expect(element('#link').textContent).toBe('Save from a link');

    harness.textWhenWorking = 'Please wait';
    fixture.detectChanges();
    expect(element('#save').textContent).toBe('Please wait');

    subject.next('ok');
    fixture.detectChanges();

    expect(element('#save').textContent).toBe('Saved!');
    expect(element('#link').textContent).toBe('Save from a link');

    click('#link');
    expect(element('#link').textContent).toBe('Saving...');
    expect(element('#save').textContent).toBe('Saved!');

    subject.next('ok');
    fixture.detectChanges();
    expect(element('#link').textContent).toBe('Saved!');
  });

  it('ignores a second click while working and keeps a single subscription', () => {
    const subject = new Subject<string>();
    const { tracked$, active } = trackSubscriptions(subject);
    harness.action = tracked$;
    fixture.detectChanges();

    click('#save');
    expect(element('#save').textContent).toBe('Saving...');
    expect(active()).toBe(1);

    click('#save');
    expect(element('#save').textContent).toBe('Saving...');
    expect(active()).toBe(1);

    subject.next('ok');
    fixture.detectChanges();

    expect(element('#save').textContent).toBe('Saved!');
    expect(active()).toBe(0);
  });

  it('unsubscribes when the host is destroyed before the action emits', () => {
    const subject = new Subject<string>();
    const { tracked$, active } = trackSubscriptions(subject);
    harness.action = tracked$;
    fixture.detectChanges();

    click('#save');
    expect(active()).toBe(1);

    fixture.destroy();

    expect(active()).toBe(0);
    expect(() => subject.next('late')).not.toThrow();
  });

  it('runs the action again after it has finished', () => {
    const subject = new Subject<string>();
    const { tracked$, active } = trackSubscriptions(subject);
    harness.action = tracked$;
    fixture.detectChanges();

    click('#save');
    subject.next('first');
    fixture.detectChanges();
    expect(element('#save').textContent).toBe('Saved!');
    expect(active()).toBe(0);

    click('#save');
    expect(element('#save').textContent).toBe('Saving...');
    expect(active()).toBe(1);

    subject.next('second');
    fixture.detectChanges();
    expect(element('#save').textContent).toBe('Saved!');
    expect(active()).toBe(0);
  });

  it('accepts a Promise and shows the done label when it resolves', async () => {
    let resolveAction!: (value: string) => void;
    harness.action = new Promise<string>((resolve) => {
      resolveAction = resolve;
    });
    fixture.detectChanges();

    click('#save');
    expect(element('#save').textContent).toBe('Saving...');

    resolveAction('ok');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element('#save').textContent).toBe('Saved!');
  });

  it('returns to the idle label when the action errors', () => {
    const subject = new Subject<string>();
    harness.action = subject;
    fixture.detectChanges();

    click('#save');
    expect(element('#save').textContent).toBe('Saving...');

    subject.error(new Error('save failed'));
    fixture.detectChanges();

    expect(element('#save').textContent).toBe('Save');

    const retry = new Subject<string>();
    harness.action = retry;
    fixture.detectChanges();
    click('#save');
    expect(element('#save').textContent).toBe('Saving...');

    retry.next('ok');
    fixture.detectChanges();
    expect(element('#save').textContent).toBe('Saved!');
  });
});
