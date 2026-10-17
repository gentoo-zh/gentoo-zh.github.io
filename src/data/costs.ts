import type {CostItem, Costs, Localized, Rates} from './schemas.ts';

export type DisplayCurrency = 'USD' | 'CNY' | 'TWD' | 'HKD';
/** One amount in every display currency, converted from USD with the file's rates. */
export type Converted = Record<DisplayCurrency, number>;
/** Decimals shown per currency: USD to the cent, the others to whole units. */
export const FRACTION_DIGITS: Record<DisplayCurrency, number> = {USD: 2, CNY: 0, TWD: 0, HKD: 0};

/** `paid` shows the amount; `free` and `sponsored` show a label and no running total. */
export type PriceKind = 'paid' | 'free' | 'sponsored';

export interface CostRow {
  key: string;
  spec: Localized;
  price: PriceKind;
  amount: number;
  currency: CostItem['currency'];
  period: CostItem['period'];
  approx: boolean;
  start: string;
  end?: string;
  expires?: string;
  /** Recorded paid terms, or started periods up to the as-of date or `end`. */
  periods: number;
  accumulated: Converted;
}

export interface CostReport {
  asOf: string;
  /** Items without `end`, in file order: the specs and ledger tables. */
  active: CostRow[];
  /** Items with `end`: the retired table. */
  retired: CostRow[];
  /** Sum of `usd_month` over active items. */
  monthlyUsd: number;
  totals: {active: Converted; retired: Converted; all: Converted};
}

const today = (): string => new Date().toISOString().slice(0, 10);

const ymd = (date: string) => date.split('-').map(Number) as [number, number, number];

/**
 * Billing periods begun between two calendar days: a monthly item counts each started
 * calendar month, a yearly item each started year, both including the first one.
 */
export function periodsBetween(start: string, until: string, period: CostItem['period']): number {
  if (until < start) return 0;
  const [startYear, startMonth, startDay] = ymd(start);
  const [year, month, day] = ymd(until);
  const months = (year - startYear) * 12 + (month - startMonth) - (day < startDay ? 1 : 0);
  return period === 'monthly' ? months + 1 : Math.floor(months / 12) + 1;
}

function convert(usd: number, rates: Rates): Converted {
  return {USD: usd, CNY: usd * rates.usd_cny, TWD: usd * rates.usd_twd, HKD: usd * rates.usd_hkd};
}

function priceKind(item: CostItem): PriceKind {
  if (item.amount !== 0) return 'paid';
  return item.sponsored ? 'sponsored' : 'free';
}

function costRow(item: CostItem, rates: Rates, asOf: string): CostRow {
  const until = item.end != null && item.end < asOf ? item.end : asOf;
  // Undated payment records describe the current ledger, including prepaid terms.
  const periods = item.paidAmounts?.length ?? periodsBetween(item.start, until, item.period);
  const rate = item.currency === 'EUR' ? rates.eur_usd : 1;
  const paidUsd = item.paidAmounts == null
    ? item.amount * rate * periods
    : item.paidAmounts.reduce((sum, amount) => sum + amount, 0) * rate;
  return {
    key: item.key,
    spec: item.spec,
    price: priceKind(item),
    amount: item.amount,
    currency: item.currency,
    period: item.period,
    approx: item.approx,
    start: item.start,
    end: item.end,
    expires: item.expires,
    periods,
    accumulated: convert(paidUsd, rates),
  };
}

const sumUsd = (rows: CostRow[]) => rows.reduce((total, row) => total + row.accumulated.USD, 0);

/** Current payment records plus inferred costs as of a calendar day (default: today, UTC). */
export function costReport(costs: Costs, asOf: string = today()): CostReport {
  const rows = costs.items.map(item => costRow(item, costs.rates, asOf));
  const active = rows.filter(row => row.end == null);
  const retired = rows.filter(row => row.end != null);
  return {
    asOf,
    active,
    retired,
    monthlyUsd: costs.items.filter(item => item.end == null).reduce((total, item) => total + item.usdMonth, 0),
    totals: {
      active: convert(sumUsd(active), costs.rates),
      retired: convert(sumUsd(retired), costs.rates),
      all: convert(sumUsd(rows), costs.rates),
    },
  };
}

/** Formats an amount with its currency's fixed decimals, grouped for the given BCP 47 tag. */
export function formatAmount(value: number, currency: DisplayCurrency, languageTag: string): string {
  const digits = FRACTION_DIGITS[currency];
  return new Intl.NumberFormat(languageTag, {minimumFractionDigits: digits, maximumFractionDigits: digits}).format(value);
}
