import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

import { Solution5Component } from './solution5.component';
import { CountryService } from './country.service';
import { AutofilterDropdownComponent } from './autofilter-dropdown/autofilter-dropdown.component';
import { DropdownOption } from './types';
import {
  CANADA,
  CA_STATES,
  COUNTRIES,
  COUNTRIES_URL,
  flushAndStabilize,
  flushCountries,
  hostText,
  httpTestingProviders,
  queryDropdownItems,
  queryDropdownItemsAt,
  queryInputs,
  selectCountryNamed,
  statesUrl,
  StringFieldValue,
  typeCountryFilter,
  typeStateFilter,
  US_STATES,
} from '../test-utils';

describe('Solution5Component', () => {
  let component: Solution5Component;
  let fixture: ComponentFixture<Solution5Component>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Solution5Component],
      providers: httpTestingProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(Solution5Component);
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

  function dropdownField(index: number): StringFieldValue {
    const dropdowns = fixture.debugElement.queryAll(By.directive(AutofilterDropdownComponent));
    const dropdown = dropdowns[index]?.componentInstance as AutofilterDropdownComponent<DropdownOption>;
    expect(dropdown).toBeDefined();
    return dropdown.textForm.text().value;
  }

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
    await flushCountries(fixture, httpTesting);

    typeCountryFilter(fixture, dropdownField(0), 'fr');

    expect(dropdownField(0)()).toBe('fr');
    const items = queryDropdownItems(fixture);
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toBe('France');
    expect(items[0].innerHTML).toBe('<b>Fr</b>ance');

    typeCountryFilter(fixture, dropdownField(0), 'AN');

    expect(dropdownField(0)()).toBe('AN');
    expect(queryDropdownItems(fixture).map((item) => item.textContent)).toEqual([
      'France',
      'Afghanistan',
    ]);
    expect(queryDropdownItems(fixture)[0].innerHTML).toBe('Fr<b>an</b>ce');
    expect(queryDropdownItems(fixture)[1].innerHTML).toBe('Afgh<b>an</b>istan');

    typeCountryFilter(fixture, dropdownField(0), 'xyz');

    expect(dropdownField(0)()).toBe('xyz');
    expect(queryDropdownItems(fixture)).toHaveLength(0);
  });

  it('loads states via httpResource after selecting a country and lists them while the state filter is empty', async () => {
    await flushCountries(fixture, httpTesting);
    typeCountryFilter(fixture, dropdownField(0), 'fr');

    const france = queryDropdownItems(fixture)[0];
    expect(france).toBeDefined();
    france.click();
    fixture.detectChanges();

    expect(dropdownField(0)()).toBe('France');
    expect(component.selectedCountry()?.id).toBe('FR');
    expect(TestBed.inject(CountryService).selectedCountryId()).toBe('FR');
    expect(queryInputs(fixture)[0].value).toBe('France');
    expect(hostText(fixture)).toContain('"id": "FR"');

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
    expect(dropdownField(1)()).toBe('');
  });

  it('filters states as the Signal Form text field updates and highlights the match', async () => {
    await flushCountries(fixture, httpTesting, [...COUNTRIES, CANADA]);
    await selectCountryNamed(
      fixture,
      httpTesting,
      dropdownField(0),
      'Canada',
      'CA',
      CA_STATES,
      () => TestBed.inject(CountryService).selectedCountryId(),
    );

    expect(queryDropdownItemsAt(fixture, 1).map((item) => item.textContent?.trim()).sort()).toEqual([
      'Alberta',
      'Ontario',
      'Quebec',
    ]);

    typeStateFilter(fixture, dropdownField(1), 'Al');

    expect(dropdownField(1)()).toBe('Al');
    const albertaItems = queryDropdownItemsAt(fixture, 1);
    expect(albertaItems).toHaveLength(1);
    expect(albertaItems[0].textContent).toBe('Alberta');
    expect(albertaItems[0].innerHTML).toBe('<b>Al</b>berta');

    typeStateFilter(fixture, dropdownField(1), 'e');

    expect(dropdownField(1)()).toBe('e');
    const eItems = queryDropdownItemsAt(fixture, 1);
    expect(eItems.map((item) => item.textContent?.trim()).sort()).toEqual(['Alberta', 'Quebec']);
    expect(eItems.find((item) => item.textContent === 'Alberta')?.innerHTML).toBe('Alb<b>e</b>rta');
    expect(eItems.find((item) => item.textContent === 'Quebec')?.innerHTML).toBe('Qu<b>e</b>bec');

    typeStateFilter(fixture, dropdownField(1), 'xyz');

    expect(dropdownField(1)()).toBe('xyz');
    expect(queryDropdownItemsAt(fixture, 1)).toHaveLength(0);
  });

  it('selecting a highlighted state is one write and changing country clears the state via linkedSignal', async () => {
    await flushCountries(fixture, httpTesting, [...COUNTRIES, CANADA]);
    await selectCountryNamed(
      fixture,
      httpTesting,
      dropdownField(0),
      'Canada',
      'CA',
      CA_STATES,
      () => TestBed.inject(CountryService).selectedCountryId(),
    );

    typeStateFilter(fixture, dropdownField(1), 'al');
    const alberta = queryDropdownItemsAt(fixture, 1)[0];
    expect(alberta).toBeDefined();
    alberta.click();
    fixture.detectChanges();

    expect(component.selectedState()?.description).toBe('Alberta');
    expect(dropdownField(1)()).toBe('Alberta');
    expect(queryInputs(fixture)[1].value).toBe('Alberta');
    expect(hostText(fixture)).toContain('"code": "AB"');

    typeCountryFilter(fixture, dropdownField(0), 'united');
    const unitedStates = queryDropdownItemsAt(fixture, 0).find(
      (item) => item.textContent?.trim() === 'United States',
    );
    expect(unitedStates).toBeDefined();
    unitedStates!.click();
    fixture.detectChanges();

    expect(component.selectedState()).toBeUndefined();
    expect(TestBed.inject(CountryService).selectedCountryId()).toBe('US');
    await flushAndStabilize(fixture, httpTesting.expectOne(statesUrl('US')), US_STATES);
    expect(dropdownField(0)()).toBe('United States');
    expect(dropdownField(1)()).toBe('');
    const stateInput = queryInputs(fixture)[1];
    expect(stateInput).toBeDefined();
    expect(stateInput.value).toBe('');
    expect(hostText(fixture)).not.toContain('"code": "AB"');
  });
});
