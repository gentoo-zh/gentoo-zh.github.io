import type {CostCredit, CostItem, Costs, Localized, Rates} from './schemas.ts';

export type DisplayCurrency = 'USD' | 'CNY' | 'TWD' | 'HKD';
/** One amount in every display currency, converted from USD with the file's rates. */
export type Converted = Record<DisplayCurrency, number>;
/** Decimals shown per currency: USD to the cent, the others to whole units. */
export const FRACTION_DIGITS: Record<DisplayCurrency, number> = {USD: 2, CNY: 0, TWD: 0, HKD: 0};

/**
 * `paid` shows the amount; `free` and `sponsored` show a label and no running total;
 * `credit` is a ledger row that deducts the used part of a credit.
 */
export type PriceKind = 'paid' | 'free' | 'sponsored' | 'credit';

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
  /** Credits only: USD left of the credit. */
  remaining?: number;
}

/** A credit as a ledger row: `accumulated` is the used part as a negative amount. */
export interface CreditRow extends CostRow {
  price: 'credit';
  /** USD billed to the covered items for periods begun from `start` to the as-of date, capped at the credit. */
  used: number;
  remaining: number;
}

export interface CostReport {
  asOf: string;
  /** Items without `end`, in file order: the specs and ledger tables. */
  active: CostRow[];
  /** Items with `end`: the retired table. */
  retired: CostRow[];
  /** Credits in file order, as ledger rows after the bills. */
  credits: CreditRow[];
  /** Sum of `usd_month` over active items. */
  monthlyUsd: number;
  /** `active` and `all` have the used credit deducted. */
  totals: {active: Converted; retired: Converted; all: Converted};
}

const today = (): string => new Date().toISOString().slice(0, 10);

const dayBefore = (date: string): string => new Date(Date.parse(date) - 86_400_000).toISOString().slice(0, 10);

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

const usdRate = (currency: CostItem['currency'], rates: Rates) => (currency === 'EUR' ? rates.eur_usd : 1);

function priceKind(item: CostItem): PriceKind {
  if (item.amount !== 0) return 'paid';
  return item.sponsored ? 'sponsored' : 'free';
}

function costRow(item: CostItem, rates: Rates, asOf: string): CostRow {
  const until = item.end != null && item.end < asOf ? item.end : asOf;
  // Undated payment records describe the current ledger, including prepaid terms.
  const periods = item.paidAmounts?.length ?? periodsBetween(item.start, until, item.period);
  const rate = usdRate(item.currency, rates);
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

function creditRow(credit: CostCredit, items: CostItem[], rates: Rates, asOf: string): CreditRow {
  const before = dayBefore(credit.start);
  const billedUsd = items.filter(item => credit.appliesTo.includes(item.key)).reduce((sum, item) => {
    const until = item.end != null && item.end < asOf ? item.end : asOf;
    const periods = Math.max(0, periodsBetween(item.start, until, item.period) - periodsBetween(item.start, before, item.period));
    return sum + item.amount * usdRate(item.currency, rates) * periods;
  }, 0);
  const amountUsd = credit.amount * usdRate(credit.currency, rates);
  const used = Math.min(amountUsd, billedUsd);
  return {
    key: credit.key,
    spec: credit.spec,
    price: 'credit',
    amount: credit.amount,
    currency: credit.currency,
    // Unused: a credit has no billing period.
    period: 'monthly',
    approx: false,
    start: credit.start,
    periods: 0,
    // 0 - used keeps an unused credit at +0, which formats without a minus sign.
    accumulated: convert(0 - used, rates),
    used,
    remaining: amountUsd - used,
  };
}

const sumUsd = (rows: CostRow[]) => rows.reduce((total, row) => total + row.accumulated.USD, 0);

/** Current payment records plus inferred costs as of a calendar day (default: today, UTC). */
export function costReport(costs: Costs, asOf: string = today()): CostReport {
  const rows = costs.items.map(item => costRow(item, costs.rates, asOf));
  const active = rows.filter(row => row.end == null);
  const retired = rows.filter(row => row.end != null);
  const credits = costs.credits.map(credit => creditRow(credit, costs.items, costs.rates, asOf));
  const usedUsd = credits.reduce((total, credit) => total + credit.used, 0);
  return {
    asOf,
    active,
    retired,
    credits,
    monthlyUsd: costs.items.filter(item => item.end == null).reduce((total, item) => total + item.usdMonth, 0),
    totals: {
      active: convert(sumUsd(active) - usedUsd, costs.rates),
      retired: convert(sumUsd(retired), costs.rates),
      all: convert(sumUsd(rows) - usedUsd, costs.rates),
    },
  };
}

/** Formats an amount with its currency's fixed decimals, grouped for the given BCP 47 tag. */
export function formatAmount(value: number, currency: DisplayCurrency, languageTag: string): string {
  const digits = FRACTION_DIGITS[currency];
  return new Intl.NumberFormat(languageTag, {minimumFractionDigits: digits, maximumFractionDigits: digits}).format(value);
}
