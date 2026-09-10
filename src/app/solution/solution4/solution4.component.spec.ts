import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { Solution4Component } from './solution4.component';
import { CountryService } from './country.service';
import {
  CANADA,
  CA_STATES,
  COUNTRIES,
  COUNTRIES_URL,
  flushAndStabilize,
  httpTestingProviders,
  queryDropdownItems,
  queryDropdownItemsAt,
  queryInputs,
  statesUrl,
  typeIn,
  US_STATES,
} from '../test-utils';

describe('Solution4Component', () => {
  let component: Solution4Component;
  let fixture: ComponentFixture<Solution4Component>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Solution4Component],
      providers: httpTestingProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(Solution4Component);
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

    typeCountryFilter('fr');

    expect(component.countryForm.country().value()).toBe('fr');
    const items = queryDropdownItems(fixture);
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toBe('France');
    expect(items[0].innerHTML).toBe('<b>Fr</b>ance');

    typeCountryFilter('AN');

    expect(component.countryForm.country().value()).toBe('AN');
    expect(queryDropdownItems(fixture).map((item) => item.textContent)).toEqual([
      'France',
      'Afghanistan',
    ]);
    expect(queryDropdownItems(fixture)[0].innerHTML).toBe('Fr<b>an</b>ce');
    expect(queryDropdownItems(fixture)[1].innerHTML).toBe('Afgh<b>an</b>istan');

    typeCountryFilter('xyz');

    expect(component.countryForm.country().value()).toBe('xyz');
    expect(queryDropdownItems(fixture)).toHaveLength(0);
  });

  it('loads states via httpResource after selecting a country and lists them while the state filter is empty', async () => {
    await flushCountries();
    typeCountryFilter('fr');

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

    expect(queryInputs(fixture)).toHaveLength(2);
    expect(queryDropdownItemsAt(fixture, 1).map((item) => item.textContent?.trim()).sort()).toEqual([
      'California',
      'New York',
    ]);
    expect(component.stateForm.state().value()).toBe('');
  });

  it('filters states as the Signal Form text field updates and highlights the match', async () => {
    await flushCountries([...COUNTRIES, CANADA]);
    await selectCountryNamed('Canada', 'CA', CA_STATES);

    expect(queryDropdownItemsAt(fixture, 1).map((item) => item.textContent?.trim()).sort()).toEqual([
      'Alberta',
      'Ontario',
      'Quebec',
    ]);

    typeStateFilter('Al');

    expect(component.stateForm.state().value()).toBe('Al');
    const albertaItems = queryDropdownItemsAt(fixture, 1);
    expect(albertaItems).toHaveLength(1);
    expect(albertaItems[0].textContent).toBe('Alberta');
    expect(albertaItems[0].innerHTML).toBe('<b>Al</b>berta');

    typeStateFilter('e');

    expect(component.stateForm.state().value()).toBe('e');
    const eItems = queryDropdownItemsAt(fixture, 1);
    expect(eItems.map((item) => item.textContent?.trim()).sort()).toEqual(['Alberta', 'Quebec']);
    expect(eItems.find((item) => item.textContent === 'Alberta')?.innerHTML).toBe('Alb<b>e</b>rta');
    expect(eItems.find((item) => item.textContent === 'Quebec')?.innerHTML).toBe('Qu<b>e</b>bec');

    typeStateFilter('xyz');

    expect(component.stateForm.state().value()).toBe('xyz');
    expect(queryDropdownItemsAt(fixture, 1)).toHaveLength(0);
  });

  it('selecting a highlighted state is one write and changing country clears the state via linkedSignal', async () => {
    await flushCountries([...COUNTRIES, CANADA]);
    await selectCountryNamed('Canada', 'CA', CA_STATES);

    typeStateFilter('al');
    const alberta = queryDropdownItemsAt(fixture, 1)[0];
    expect(alberta).toBeDefined();
    alberta.click();
    fixture.detectChanges();

    expect(component.selectedState()?.description).toBe('Alberta');
    expect(component.stateForm.state().value()).toBe('Alberta');
    expect(queryInputs(fixture)[1].value).toBe('Alberta');

    typeCountryFilter('united');
    const unitedStates = queryDropdownItemsAt(fixture, 0).find(
      (item) => item.textContent?.trim() === 'United States',
    );
    expect(unitedStates).toBeDefined();
    unitedStates!.click();
    fixture.detectChanges();

    expect(component.selectedState()).toBeUndefined();
    expect(TestBed.inject(CountryService).selectedCountryId()).toBe('US');
    await flushAndStabilize(fixture, httpTesting.expectOne(statesUrl('US')), US_STATES);
    expect(component.countryForm.country().value()).toBe('United States');
    expect(component.stateForm.state().value()).toBe('');
    const stateInput = queryInputs(fixture)[1];
    expect(stateInput).toBeDefined();
    expect(stateInput.value).toBe('');
  });

  async function flushCountries(
    countries: typeof COUNTRIES = COUNTRIES,
  ): Promise<void> {
    fixture.detectChanges();
    await flushAndStabilize(fixture, httpTesting.expectOne(COUNTRIES_URL), countries);
  }

  async function selectCountryNamed(
    name: string,
    countryId: string,
    states: typeof CA_STATES,
  ): Promise<void> {
    typeCountryFilter(name.toLowerCase());
    const match = queryDropdownItemsAt(fixture, 0).find((item) => item.textContent?.trim() === name);
    expect(match).toBeDefined();
    match!.click();
    fixture.detectChanges();
    expect(TestBed.inject(CountryService).selectedCountryId()).toBe(countryId);
    await flushAndStabilize(fixture, httpTesting.expectOne(statesUrl(countryId)), states);
  }

  function typeCountryFilter(value: string): void {
    const input = queryInputs(fixture)[0];
    expect(input).toBeDefined();
    typeIn(fixture, input, value);
    if (component.countryForm.country().value() !== value) {
      component.countryForm.country().value.set(value);
      fixture.detectChanges();
    }
  }

  function typeStateFilter(value: string): void {
    const input = queryInputs(fixture)[1];
    expect(input).toBeDefined();
    typeIn(fixture, input, value);
    if (component.stateForm.state().value() !== value) {
      component.stateForm.state().value.set(value);
      fixture.detectChanges();
    }
  }
});
