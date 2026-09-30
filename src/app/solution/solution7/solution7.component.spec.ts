import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Solution7Component } from './solution7.component';

describe('Solution7Component', () => {
  let fixture: ComponentFixture<Solution7Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Solution7Component],
    }).compileComponents();

    fixture = TestBed.createComponent(Solution7Component);
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  function hosts(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('app-state-button'));
  }

  function buttonHost(): HTMLElement {
    const host = hosts()[0];
    if (!host) {
      throw new Error('missing demo button host');
    }
    return host;
  }

  function linkHost(): HTMLElement {
    const host = hosts()[1];
    if (!host) {
      throw new Error('missing demo link host');
    }
    return host;
  }

  function clickHost(host: HTMLElement): void {
    const projected: HTMLElement | null = host.querySelector('button, a, img, h4');
    const el = projected ?? host;
    el.addEventListener('click', (event) => event.preventDefault());
    el.click();
    fixture.detectChanges();
  }

  it('shows the idle slots on the demo button and the demo link', () => {
    fixture.detectChanges();

    expect(buttonHost().textContent?.trim()).toBe('Save');
    expect(buttonHost().querySelector('[default]')).toBeTruthy();
    expect(linkHost().querySelector('a')?.textContent).toBe('Save from a link');
    expect(linkHost().querySelector('img')).toBeNull();
    expect(linkHost().querySelector('h4')).toBeNull();
    expect(fixture.componentInstance.action$).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('app-state-button')).length).toBe(2);
  });

  it('moves the button through the spinner to Saved! and ignores a second click while working', async () => {
    vi.useFakeTimers();
    fixture.detectChanges();

    clickHost(buttonHost());
    expect(buttonHost().querySelector('img')).toBeTruthy();
    expect(buttonHost().querySelector('[working]')).toBeTruthy();
    expect(linkHost().querySelector('a')?.textContent).toBe('Save from a link');

    await vi.advanceTimersByTimeAsync(1500);
    clickHost(buttonHost());
    expect(buttonHost().querySelector('img')).toBeTruthy();
    expect(buttonHost().textContent).not.toContain('Saved!');

    await vi.advanceTimersByTimeAsync(500);
    fixture.detectChanges();
    expect(buttonHost().textContent?.trim()).toBe('Saved!');
    expect(buttonHost().querySelector('img')).toBeNull();
    expect(linkHost().querySelector('a')?.textContent).toBe('Save from a link');
  });

  it('runs the same demo action on a link', async () => {
    vi.useFakeTimers();
    fixture.detectChanges();

    clickHost(linkHost());
    expect(linkHost().querySelector('img')).toBeTruthy();
    expect(linkHost().querySelector('a')).toBeNull();
    expect(buttonHost().textContent?.trim()).toBe('Save');

    await vi.advanceTimersByTimeAsync(2000);
    fixture.detectChanges();

    expect(linkHost().querySelector('h4')?.textContent).toBe('Done!');
    expect(linkHost().querySelector('img')).toBeNull();
    expect(buttonHost().textContent?.trim()).toBe('Save');
  });

  it('starts a new timer after the action has finished', async () => {
    vi.useFakeTimers();
    fixture.detectChanges();

    clickHost(buttonHost());
    await vi.advanceTimersByTimeAsync(2000);
    fixture.detectChanges();
    expect(buttonHost().textContent?.trim()).toBe('Saved!');

    clickHost(buttonHost());
    expect(buttonHost().querySelector('img')).toBeTruthy();
    expect(buttonHost().textContent).not.toContain('Saved!');

    await vi.advanceTimersByTimeAsync(1999);
    fixture.detectChanges();
    expect(buttonHost().querySelector('[working]')).toBeTruthy();

    await vi.advanceTimersByTimeAsync(1);
    fixture.detectChanges();
    expect(buttonHost().textContent?.trim()).toBe('Saved!');
  });
});
