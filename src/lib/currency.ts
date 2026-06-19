// Currency helpers mirroring the backend. Meta returns/expects budgets in
// the currency's smallest denomination — cents for most currencies, but
// whole units for zero-decimal currencies like COP. Dividing a COP budget
// by 100 would display it 100x too small.

const ZERO_DECIMAL_CURRENCIES = new Set([
  "CLP",
  "COP",
  "CRC",
  "HUF",
  "ISK",
  "JPY",
  "KRW",
  "PYG",
  "TWD",
  "UGX",
  "VND",
]);

export function currencyMinorUnit(currency: string | null | undefined): number {
  return ZERO_DECIMAL_CURRENCIES.has((currency ?? "").toUpperCase()) ? 1 : 100;
}

/** Meta minor units -> whole currency units. */
export function fromMinorUnits(
  value: number,
  currency: string | null | undefined,
): number {
  return value / currencyMinorUnit(currency);
}
