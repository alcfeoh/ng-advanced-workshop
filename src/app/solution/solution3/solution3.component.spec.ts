import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { Solution3Component } from './solution3.component';
import { CountryService } from './country.service';
import {
  COUNTRIES,
  COUNTRIES_URL,
  flushAndStabilize,
  hostText,
  httpTestingProviders,
  queryDropdownItems,
  queryInputs,
  statesUrl,
  typeIn,
  US_STATES,
} from '../test-utils';

describe('Solution3Component', () => {
  let component: Solution3Component;
  let fixture: ComponentFixture<Solution3Component>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Solution3Component],
      providers: httpTestingProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(Solution3Component);
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

  it('loads countries and lists them all while the filter is empty', async () => {
    fixture.detectChanges();

    expect(queryDropdownItems(fixture)).toHaveLength(0);
    const countriesReq = httpTesting.expectOne(COUNTRIES_URL);
    expect(countriesReq.request.method).toBe('GET');
    httpTesting.expectNone((req) => req.url.includes('/states'));

    await flushAndStabilize(fixture, countriesReq, COUNTRIES);

    expect(queryDropdownItems(fixture).map((item) => item.textContent)).toEqual(
      COUNTRIES.map((country) => country.description),
    );
    httpTesting.expectNone((req) => req.url.includes('/states'));
  });

  it('filters countries as the Signal Form text field updates and highlights the match', async () => {
    await flushCountries();

    typeFilter('fr');

    expect(component.countryForm.country().value()).toBe('fr');
    const items = queryDropdownItems(fixture);
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toBe('France');
    expect(items[0].innerHTML).toBe('<b>Fr</b>ance');

    typeFilter('AN');

    expect(component.countryForm.country().value()).toBe('AN');
    expect(queryDropdownItems(fixture).map((item) => item.textContent)).toEqual([
      'France',
      'Afghanistan',
    ]);
    expect(queryDropdownItems(fixture)[0].innerHTML).toBe('Fr<b>an</b>ce');
    expect(queryDropdownItems(fixture)[1].innerHTML).toBe('Afgh<b>an</b>istan');

    typeFilter('xyz');

    expect(component.countryForm.country().value()).toBe('xyz');
    expect(queryDropdownItems(fixture)).toHaveLength(0);
  });

  it('loads states via httpResource after selecting a highlighted country and updates the Signal Form field', async () => {
    await flushCountries();
    typeFilter('fr');

    const france = queryDropdownItems(fixture)[0];
    expect(france).toBeDefined();
    france.click();
    fixture.detectChanges();

    expect(component.countryForm.country().value()).toBe('France');
    expect(TestBed.inject(CountryService).selectedCountry()?.id).toBe('FR');
    expect(TestBed.inject(CountryService).selectedCountryId()).toBe('FR');
    expect(queryInputs(fixture)[0].value).toBe('France');

    const statesReq = httpTesting.expectOne(statesUrl('FR'));
    expect(statesReq.request.method).toBe('GET');
    expect(
      statesReq.request.params.get('countryCode') ??
        new URL(statesReq.request.urlWithParams).searchParams.get('countryCode'),
    ).toBe('FR');
    await flushAndStabilize(fixture, statesReq, US_STATES);

    expect(hostText(fixture)).toContain('New York');
    expect(hostText(fixture)).toContain('California');
    expect(queryInputs(fixture)[1].disabled).toBe(false);

    const newYork = queryDropdownItems(fixture).find((item) => item.textContent?.trim() === 'New York');
    expect(newYork).toBeDefined();
    newYork!.click();
    fixture.detectChanges();

    expect(component.state()?.description).toBe('New York');
    expect(queryInputs(fixture)[1].value).toBe('New York');

    typeFilter('united');
    const unitedStates = queryDropdownItems(fixture).find(
      (item) => item.textContent?.trim() === 'United States',
    );
    expect(unitedStates).toBeDefined();
    unitedStates!.click();
    fixture.detectChanges();

    expect(component.state()).toBeUndefined();
    expect(TestBed.inject(CountryService).selectedCountryId()).toBe('US');
    await flushAndStabilize(fixture, httpTesting.expectOne(statesUrl('US')), US_STATES);
    expect(component.countryForm.country().value()).toBe('United States');
    const stateInput = queryInputs(fixture)[1];
    expect(stateInput).toBeDefined();
    expect(stateInput.value).toBe('');
  });

  async function flushCountries(): Promise<void> {
    fixture.detectChanges();
    await flushAndStabilize(fixture, httpTesting.expectOne(COUNTRIES_URL), COUNTRIES);
  }

  function typeFilter(value: string): void {
    const input = queryInputs(fixture)[0];
    expect(input).toBeDefined();
    typeIn(fixture, input, value);
    if (component.countryForm.country().value() !== value) {
      component.countryForm.country().value.set(value);
      fixture.detectChanges();
    }
  }
});
