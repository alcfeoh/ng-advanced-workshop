import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Solution6Component } from './solution6.component';

describe('Solution6Component', () => {
  let fixture: ComponentFixture<Solution6Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Solution6Component],
    }).compileComponents();

    fixture = TestBed.createComponent(Solution6Component);
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  function button(): HTMLButtonElement {
    const found: HTMLButtonElement | null = fixture.nativeElement.querySelector('button');
    if (!found) {
      throw new Error('missing demo button');
    }
    return found;
  }

  function link(): HTMLAnchorElement {
    const found: HTMLAnchorElement | null = fixture.nativeElement.querySelector('a');
    if (!found) {
      throw new Error('missing demo link');
    }
    return found;
  }

  function click(selector: 'button' | 'a'): void {
    const host = fixture.debugElement.query(By.css(selector));
    if (!host) {
      throw new Error(`missing ${selector}`);
    }
    const el: HTMLElement = host.nativeElement;
    el.addEventListener('click', (event) => event.preventDefault());
    el.click();
    fixture.detectChanges();
  }

  it('shows the idle label on the demo button and the demo link', () => {
    fixture.detectChanges();

    expect(button().textContent).toBe('Save');
    expect(link().textContent).toBe('Save from a link');
    expect(fixture.componentInstance.action$).toBeTruthy();
  });

  it('moves the button through Saving... to Saved! and ignores a second click while working', async () => {
    vi.useFakeTimers();
    fixture.detectChanges();

    click('button');
    expect(button().textContent).toBe('Saving...');
    expect(link().textContent).toBe('Save from a link');

    await vi.advanceTimersByTimeAsync(1500);
    click('button');
    expect(button().textContent).toBe('Saving...');

    await vi.advanceTimersByTimeAsync(500);
    fixture.detectChanges();
    expect(button().textContent).toBe('Saved!');
    expect(link().textContent).toBe('Save from a link');
  });

  it('runs the same demo action on a link', async () => {
    vi.useFakeTimers();
    fixture.detectChanges();

    click('a');
    expect(link().textContent).toBe('Saving...');
    expect(button().textContent).toBe('Save');

    await vi.advanceTimersByTimeAsync(2000);
    fixture.detectChanges();

    expect(link().textContent).toBe('Saved!');
    expect(button().textContent).toBe('Save');
  });

  it('starts a new timer after the action has finished', async () => {
    vi.useFakeTimers();
    fixture.detectChanges();

    click('button');
    await vi.advanceTimersByTimeAsync(2000);
    fixture.detectChanges();
    expect(button().textContent).toBe('Saved!');

    click('button');
    expect(button().textContent).toBe('Saving...');

    await vi.advanceTimersByTimeAsync(1999);
    fixture.detectChanges();
    expect(button().textContent).toBe('Saving...');

    await vi.advanceTimersByTimeAsync(1);
    fixture.detectChanges();
    expect(button().textContent).toBe('Saved!');
  });
});
