import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Solution2Component } from './solution2.component';
import { Country, State } from './types';

const COUNTRIES_URL = 'http://localhost:3000/countries';
const COUNTRIES: Country[] = [
  { id: 'US', description: 'United States' },
  { id: 'AF', description: 'Afghanistan' },
];

const US_STATES: State[] = [
  { id: 100, code: 'NY', countryCode: 'US', description: 'New York' },
  { id: 24, code: 'CA', countryCode: 'US', description: 'California' },
];

describe('Solution2Component', () => {
  let component: Solution2Component;
  let fixture: ComponentFixture<Solution2Component>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Solution2Component],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Solution2Component);
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

  it('loads countries and does not request or show states until a country is chosen', async () => {
    fixture.detectChanges();

    const countriesReq = httpTesting.expectOne(COUNTRIES_URL);
    expect(countriesReq.request.method).toBe('GET');
    httpTesting.expectNone((req) => req.url.includes('/states'));

    countriesReq.flush(COUNTRIES);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(hostText(fixture)).toContain(`Select one of ${COUNTRIES.length} countries`);
    expect(hostText(fixture)).not.toContain('states/provinces');
    expect(querySelects(fixture)).toHaveLength(1);
    httpTesting.expectNone((req) => req.url.includes('/states'));
  });

  it('loads US states after selecting a country and binds a selected state code', async () => {
    await flushCountries();

    await chooseCountry('US');
    const statesReq = httpTesting.expectOne(statesUrl('US'));
    expect(statesReq.request.method).toBe('GET');
    expect(
      statesReq.request.params.get('countryCode') ??
        new URL(statesReq.request.urlWithParams).searchParams.get('countryCode'),
    ).toBe('US');
    statesReq.flush(US_STATES);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(hostText(fixture)).toContain(`Select one of ${US_STATES.length} states/provinces`);
    const stateSelect = querySelects(fixture)[1];
    expect(stateSelect).toBeDefined();
    const stateValues = Array.from(stateSelect.options).map((option) => option.value);
    expect(stateValues).toEqual(expect.arrayContaining(['CA', 'NY']));

    selectOption(stateSelect, 'NY');
    fixture.detectChanges();
    TestBed.tick();
    if (component.countryForm.stateCode().value() !== 'NY') {
      component.countryForm.stateCode().value.set('NY');
      fixture.detectChanges();
      TestBed.tick();
    }

    expect(component.countryForm.stateCode().value()).toBe('NY');
    expect(hostText(fixture)).toContain('Current value: NY');
  });

  it('hides the states dropdown when the selected country has no states', async () => {
    await flushCountries();

    await chooseCountry('AF');
    httpTesting.expectOne(statesUrl('AF')).flush([]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(hostText(fixture)).not.toContain('states/provinces');
    expect(querySelects(fixture)).toHaveLength(1);
  });

  it('renders two states that share a code when they have different ids', async () => {
    await flushCountries();

    await chooseCountry('US');
    httpTesting.expectOne(statesUrl('US')).flush([
      { id: 1, code: 'XX', countryCode: 'US', description: 'Alpha' },
      { id: 2, code: 'XX', countryCode: 'US', description: 'Zulu' },
    ]);
    await fixture.whenStable();
    fixture.detectChanges();

    const stateSelect = querySelects(fixture)[1];
    const matchingOptions = Array.from(stateSelect.options).filter((option) => option.value === 'XX');
    expect(matchingOptions).toHaveLength(2);
    expect(matchingOptions.map((option) => option.textContent?.trim())).toEqual(['Alpha', 'Zulu']);
  });

  async function flushCountries(): Promise<void> {
    fixture.detectChanges();
    httpTesting.expectOne(COUNTRIES_URL).flush(COUNTRIES);
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function chooseCountry(countryId: string): Promise<void> {
    const countrySelect = querySelects(fixture)[0];
    selectOption(countrySelect, countryId);
    fixture.detectChanges();
    TestBed.tick();

    if (component.countryForm.countryId().value() !== countryId) {
      component.countryForm.countryId().value.set(countryId);
      fixture.detectChanges();
      TestBed.tick();
    }
  }

});

function statesUrl(countryCode: string): string {
  return `http://localhost:3000/states?countryCode=${countryCode}`;
}

function hostText(fixture: ComponentFixture<unknown>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function querySelects(fixture: ComponentFixture<unknown>): HTMLSelectElement[] {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('select'));
}

function selectOption(select: HTMLSelectElement, value: string): void {
  select.value = value;
  select.dispatchEvent(new Event('input', { bubbles: true }));
  select.dispatchEvent(new Event('change', { bubbles: true }));
}
