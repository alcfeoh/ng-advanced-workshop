import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { Solution2Component } from './solution2.component';
import {
  COUNTRIES,
  COUNTRIES_URL,
  flushAndStabilize,
  hostText,
  httpTestingProviders,
  querySelects,
  selectOption,
  statesUrl,
  US_STATES,
} from '../test-utils';

describe('Solution2Component', () => {
  let component: Solution2Component;
  let fixture: ComponentFixture<Solution2Component>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Solution2Component],
      providers: httpTestingProviders(),
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

    await flushAndStabilize(fixture, countriesReq, COUNTRIES);

    expect(hostText(fixture)).toContain(`Select one of ${COUNTRIES.length} countries`);
    expect(hostText(fixture)).not.toContain('states/provinces');
    expect(querySelects(fixture)).toHaveLength(1);
    httpTesting.expectNone((req) => req.url.includes('/states'));
  });

  it('loads US states after selecting a country and binds a selected state code', async () => {
    await flushCountries();

    chooseCountry('US');
    const statesReq = httpTesting.expectOne(statesUrl('US'));
    expect(statesReq.request.method).toBe('GET');
    expect(
      statesReq.request.params.get('countryCode') ??
        new URL(statesReq.request.urlWithParams).searchParams.get('countryCode'),
    ).toBe('US');
    await flushAndStabilize(fixture, statesReq, US_STATES);

    expect(hostText(fixture)).toContain(`Select one of ${US_STATES.length} states/provinces`);
    const stateSelect = querySelects(fixture)[1];
    expect(stateSelect).toBeDefined();
    const stateValues = Array.from(stateSelect.options).map((option) => option.value);
    expect(stateValues).toEqual(expect.arrayContaining(['CA', 'NY']));

    selectOption(fixture, stateSelect, 'NY');
    if (component.countryForm.stateCode().value() !== 'NY') {
      component.countryForm.stateCode().value.set('NY');
      fixture.detectChanges();
    }

    expect(component.countryForm.stateCode().value()).toBe('NY');
    expect(hostText(fixture)).toContain('Current value: NY');
  });

  it('hides the states dropdown when the selected country has no states', async () => {
    await flushCountries();

    chooseCountry('AF');
    await flushAndStabilize(fixture, httpTesting.expectOne(statesUrl('AF')), []);

    expect(hostText(fixture)).not.toContain('states/provinces');
    expect(querySelects(fixture)).toHaveLength(1);
  });

  it('renders two states that share a code when they have different ids', async () => {
    await flushCountries();

    chooseCountry('US');
    await flushAndStabilize(fixture, httpTesting.expectOne(statesUrl('US')), [
      { id: 1, code: 'XX', countryCode: 'US', description: 'Alpha' },
      { id: 2, code: 'XX', countryCode: 'US', description: 'Zulu' },
    ]);

    const stateSelect = querySelects(fixture)[1];
    const matchingOptions = Array.from(stateSelect.options).filter((option) => option.value === 'XX');
    expect(matchingOptions).toHaveLength(2);
    expect(matchingOptions.map((option) => option.textContent?.trim())).toEqual(['Alpha', 'Zulu']);
  });

  async function flushCountries(): Promise<void> {
    fixture.detectChanges();
    await flushAndStabilize(fixture, httpTesting.expectOne(COUNTRIES_URL), COUNTRIES);
  }

  function chooseCountry(countryId: string): void {
    selectOption(fixture, querySelects(fixture)[0], countryId);
    if (component.countryForm.countryId().value() !== countryId) {
      component.countryForm.countryId().value.set(countryId);
      fixture.detectChanges();
    }
  }
});
