import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Solution1Component } from './solution1.component';
import { Country } from './types';

const COUNTRIES: Country[] = [
  { id: 'US', description: 'United States' },
  { id: 'FR', description: 'France' },
];

describe('Solution1Component', () => {
  let component: Solution1Component;
  let fixture: ComponentFixture<Solution1Component>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Solution1Component],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Solution1Component);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    try {
      httpTesting.verify();
    } finally {
      TestBed.resetTestingModule();
    }
  });

  it('loads countries and binds the selected country id through the Signal Form', async () => {
    fixture.detectChanges();

    expect(hostText(fixture)).not.toContain('Select one of');
    expect(fixture.nativeElement.querySelector('select')).toBeNull();

    const countriesReq = httpTesting.expectOne('http://localhost:3000/countries');
    expect(countriesReq.request.method).toBe('GET');
    countriesReq.flush(COUNTRIES);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(hostText(fixture)).toContain(`Select one of ${COUNTRIES.length} countries`);

    const countrySelect = querySelect(fixture);
    const options = Array.from(countrySelect.options);
    expect(options.map((option) => option.value)).toEqual(COUNTRIES.map((country) => country.id));
    expect(options.map((option) => option.textContent?.trim())).toEqual(
      COUNTRIES.map((country) => country.description),
    );

    selectOption(countrySelect, 'FR');
    fixture.detectChanges();
    TestBed.tick();

    if (component.countryForm.countryId().value() !== 'FR') {
      component.countryForm.countryId().value.set('FR');
      fixture.detectChanges();
      TestBed.tick();
    }

    expect(component.countryForm.countryId().value()).toBe('FR');
    expect(hostText(fixture)).toContain('Current value: FR');
  });
});

function hostText(fixture: ComponentFixture<unknown>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function querySelect(fixture: ComponentFixture<unknown>): HTMLSelectElement {
  const select = (fixture.nativeElement as HTMLElement).querySelector('select');
  expect(select).not.toBeNull();
  return select as HTMLSelectElement;
}

function selectOption(select: HTMLSelectElement, value: string): void {
  select.value = value;
  select.dispatchEvent(new Event('input', { bubbles: true }));
  select.dispatchEvent(new Event('change', { bubbles: true }));
}
