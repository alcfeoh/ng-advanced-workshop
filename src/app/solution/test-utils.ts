import { ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

export const COUNTRIES_URL = 'http://localhost:3000/countries';

export const COUNTRIES = [
  { id: 'US', description: 'United States' },
  { id: 'FR', description: 'France' },
  { id: 'AF', description: 'Afghanistan' },
];

export const US_STATES = [
  { id: 100, code: 'NY', countryCode: 'US', description: 'New York' },
  { id: 24, code: 'CA', countryCode: 'US', description: 'California' },
];

export const CANADA = { id: 'CA', description: 'Canada' };

export const CA_STATES = [
  { id: 1, code: 'AB', countryCode: 'CA', description: 'Alberta' },
  { id: 104, code: 'ON', countryCode: 'CA', description: 'Ontario' },
  { id: 120, code: 'QC', countryCode: 'CA', description: 'Quebec' },
];

export function httpTestingProviders() {
  return [provideHttpClient(), provideHttpClientTesting()];
}

export function statesUrl(countryCode: string): string {
  return `http://localhost:3000/states?countryCode=${countryCode}`;
}

export function hostText(fixture: ComponentFixture<unknown>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

export function querySelects(fixture: ComponentFixture<unknown>): HTMLSelectElement[] {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('select'));
}

export function querySelect(fixture: ComponentFixture<unknown>): HTMLSelectElement {
  const select = querySelects(fixture)[0];
  expect(select).toBeDefined();
  return select;
}

export function queryInputs(fixture: ComponentFixture<unknown>): HTMLInputElement[] {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('input'));
}

export function queryDropdownItems(fixture: ComponentFixture<unknown>): HTMLElement[] {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.dropdown-content span'));
}

export function queryDropdowns(fixture: ComponentFixture<unknown>): HTMLElement[] {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.dropdown'));
}

export function queryDropdownItemsAt(
  fixture: ComponentFixture<unknown>,
  dropdownIndex: number,
): HTMLElement[] {
  const dropdown = queryDropdowns(fixture)[dropdownIndex];
  expect(dropdown).toBeDefined();
  return Array.from(dropdown.querySelectorAll('.dropdown-content span'));
}

export function typeIn(
  fixture: ComponentFixture<unknown>,
  input: HTMLInputElement,
  value: string,
): void {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  // [formField] applies native input events during CD, not whenStable.
  fixture.detectChanges();
}

export function selectOption(
  fixture: ComponentFixture<unknown>,
  select: HTMLSelectElement,
  value: string,
): void {
  select.value = value;
  select.dispatchEvent(new Event('input', { bubbles: true }));
  select.dispatchEvent(new Event('change', { bubbles: true }));
  // [formField] applies native select events during CD, not whenStable.
  fixture.detectChanges();
}

export async function flushAndStabilize(
  fixture: ComponentFixture<unknown>,
  req: { flush: (body: unknown) => void },
  body: unknown,
): Promise<void> {
  req.flush(body);
  await fixture.whenStable();
  // whenStable resolves httpResource/async pipe; the fixture view still needs a CD pass to render @if/options.
  fixture.detectChanges();
}

/** Signal Forms field `.value` accessor: callable getter plus `.set()`. */
export type StringFieldValue = {
  (): string;
  set(value: string): void;
};

export async function flushCountries(
  fixture: ComponentFixture<unknown>,
  httpTesting: HttpTestingController,
  countries: Array<{ id: string; description: string }> = COUNTRIES,
): Promise<void> {
  fixture.detectChanges();
  await flushAndStabilize(fixture, httpTesting.expectOne(COUNTRIES_URL), countries);
}

function typeFilterAt(
  fixture: ComponentFixture<unknown>,
  inputIndex: number,
  fieldValue: StringFieldValue,
  value: string,
): void {
  const input = queryInputs(fixture)[inputIndex];
  expect(input).toBeDefined();
  typeIn(fixture, input, value);
  if (fieldValue() !== value) {
    fieldValue.set(value);
    fixture.detectChanges();
  }
}

export function typeCountryFilter(
  fixture: ComponentFixture<unknown>,
  fieldValue: StringFieldValue,
  value: string,
): void {
  typeFilterAt(fixture, 0, fieldValue, value);
}

export function typeStateFilter(
  fixture: ComponentFixture<unknown>,
  fieldValue: StringFieldValue,
  value: string,
): void {
  typeFilterAt(fixture, 1, fieldValue, value);
}

export async function selectCountryNamed(
  fixture: ComponentFixture<unknown>,
  httpTesting: HttpTestingController,
  countryFieldValue: StringFieldValue,
  name: string,
  countryId: string,
  states: Array<{ id: number; code: string; countryCode: string; description: string }>,
  selectedCountryId: () => string,
): Promise<void> {
  typeCountryFilter(fixture, countryFieldValue, name.toLowerCase());
  const match = queryDropdownItemsAt(fixture, 0).find((item) => item.textContent?.trim() === name);
  expect(match).toBeDefined();
  match!.click();
  fixture.detectChanges();
  expect(selectedCountryId()).toBe(countryId);
  await flushAndStabilize(fixture, httpTesting.expectOne(statesUrl(countryId)), states);
}
