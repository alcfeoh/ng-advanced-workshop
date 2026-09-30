import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';

import { StateButtonComponent } from './state-button.component';

@Component({
    selector: 'app-state-button-harness',
    imports: [StateButtonComponent],
    template: `
      <app-state-button id="save" [action]="action()">
        <button default type="button">Save</button>
        <button working type="button">Saving...</button>
        <button done type="button">Saved!</button>
      </app-state-button>
      <app-state-button id="link" [action]="action()">
        <a default href="javascript:void(0)">Save from a link</a>
        <img working alt="loading" src="assets/loader.gif" />
        <h4 done>Done!</h4>
      </app-state-button>
    `,
})
class StateButtonHarnessComponent {
  readonly action = signal<Observable<unknown> | Promise<unknown>>(new Subject<unknown>());
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

describe('StateButtonComponent', () => {
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
    const projected: HTMLElement | null = host.nativeElement.querySelector('button, a, img, h4');
    const el: HTMLElement = projected ?? host.nativeElement;
    el.addEventListener('click', (event) => event.preventDefault());
    el.click();
    fixture.detectChanges();
  }

  it('shows default projected content when idle', () => {
    fixture.detectChanges();

    const save = element('#save');
    expect(save.textContent?.trim()).toBe('Save');
    expect(save.querySelector('[default]')).toBeTruthy();
    expect(save.querySelector('[working]')).toBeNull();
    expect(save.querySelector('[done]')).toBeNull();

    const link = element('#link');
    expect(link.querySelector('a')?.textContent).toBe('Save from a link');
    expect(link.querySelector('img')).toBeNull();
    expect(link.querySelector('h4')).toBeNull();
  });

  it('shows the working slot on click and the done slot when the action emits', () => {
    const subject = new Subject<string>();
    harness.action.set(subject);
    fixture.detectChanges();

    click('#save');
    expect(element('#save').textContent?.trim()).toBe('Saving...');
    expect(element('#save').querySelector('[working]')).toBeTruthy();
    expect(element('#save').querySelector('[default]')).toBeNull();
    expect(element('#link').querySelector('a')?.textContent).toBe('Save from a link');

    subject.next('ok');
    fixture.detectChanges();

    expect(element('#save').textContent?.trim()).toBe('Saved!');
    expect(element('#save').querySelector('[done]')).toBeTruthy();
    expect(element('#save').querySelector('[working]')).toBeNull();
    expect(element('#link').querySelector('a')?.textContent).toBe('Save from a link');

    click('#link');
    expect(element('#link').querySelector('img')).toBeTruthy();
    expect(element('#link').querySelector('a')).toBeNull();
    expect(element('#link').querySelector('h4')).toBeNull();
    expect(element('#save').textContent?.trim()).toBe('Saved!');

    subject.next('ok');
    fixture.detectChanges();
    expect(element('#link').querySelector('h4')?.textContent).toBe('Done!');
    expect(element('#link').querySelector('img')).toBeNull();
  });

  it('ignores a second click while working and keeps a single subscription', () => {
    const subject = new Subject<string>();
    const { tracked$, active } = trackSubscriptions(subject);
    harness.action.set(tracked$);
    fixture.detectChanges();

    click('#save');
    expect(element('#save').textContent?.trim()).toBe('Saving...');
    expect(active()).toBe(1);

    click('#save');
    expect(element('#save').textContent?.trim()).toBe('Saving...');
    expect(active()).toBe(1);

    subject.next('ok');
    fixture.detectChanges();

    expect(element('#save').textContent?.trim()).toBe('Saved!');
    expect(active()).toBe(0);
  });

  it('unsubscribes when the host is destroyed before the action emits', () => {
    const subject = new Subject<string>();
    const { tracked$, active } = trackSubscriptions(subject);
    harness.action.set(tracked$);
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
    harness.action.set(tracked$);
    fixture.detectChanges();

    click('#save');
    subject.next('first');
    fixture.detectChanges();
    expect(element('#save').textContent?.trim()).toBe('Saved!');
    expect(active()).toBe(0);

    click('#save');
    expect(element('#save').textContent?.trim()).toBe('Saving...');
    expect(active()).toBe(1);

    subject.next('second');
    fixture.detectChanges();
    expect(element('#save').textContent?.trim()).toBe('Saved!');
    expect(active()).toBe(0);
  });

  it('accepts a Promise and shows the done slot when it resolves', async () => {
    let resolveAction!: (value: string) => void;
    harness.action.set(new Promise<string>((resolve) => {
      resolveAction = resolve;
    }));
    fixture.detectChanges();

    click('#save');
    expect(element('#save').textContent?.trim()).toBe('Saving...');

    resolveAction('ok');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element('#save').textContent?.trim()).toBe('Saved!');
  });

  it('returns to the idle slot when the action errors', () => {
    const subject = new Subject<string>();
    harness.action.set(subject);
    fixture.detectChanges();

    click('#save');
    expect(element('#save').textContent?.trim()).toBe('Saving...');

    subject.error(new Error('save failed'));
    fixture.detectChanges();

    expect(element('#save').textContent?.trim()).toBe('Save');
    expect(element('#save').querySelector('[default]')).toBeTruthy();
    expect(element('#save').querySelector('[working]')).toBeNull();

    const retry = new Subject<string>();
    harness.action.set(retry);
    fixture.detectChanges();
    click('#save');
    expect(element('#save').textContent?.trim()).toBe('Saving...');

    retry.next('ok');
    fixture.detectChanges();
    expect(element('#save').textContent?.trim()).toBe('Saved!');
  });
});
