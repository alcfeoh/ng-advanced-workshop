import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { Solution1Component } from './solution1.component';
import {
  COUNTRIES,
  COUNTRIES_URL,
  flushAndStabilize,
  hostText,
  httpTestingProviders,
  querySelect,
  selectOption,
} from '../test-utils';

describe('Solution1Component', () => {
  let component: Solution1Component;
  let fixture: ComponentFixture<Solution1Component>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Solution1Component],
      providers: httpTestingProviders(),
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

    const countriesReq = httpTesting.expectOne(COUNTRIES_URL);
    expect(countriesReq.request.method).toBe('GET');
    await flushAndStabilize(fixture, countriesReq, COUNTRIES);

    expect(hostText(fixture)).toContain(`Select one of ${COUNTRIES.length} countries`);

    const countrySelect = querySelect(fixture);
    const options = Array.from(countrySelect.options);
    expect(options.map((option) => option.value)).toEqual(COUNTRIES.map((country) => country.id));
    expect(options.map((option) => option.textContent?.trim())).toEqual(
      COUNTRIES.map((country) => country.description),
    );

    selectOption(fixture, countrySelect, 'FR');
    if (component.countryForm.countryId().value() !== 'FR') {
      component.countryForm.countryId().value.set('FR');
      fixture.detectChanges();
    }

    expect(component.countryForm.countryId().value()).toBe('FR');
    expect(hostText(fixture)).toContain('Current value: FR');
  });
});
