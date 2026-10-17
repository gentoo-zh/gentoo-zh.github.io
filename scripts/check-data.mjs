// Validate data schemas; compare cost calculations against the pinned Hugo baseline.
import {readFileSync} from 'node:fs';
import {report} from './lib/html.mjs';
import {costReport, formatAmount, periodsBetween} from '../src/data/costs.ts';
import {defaultMirror, mirrorOrder, officialMirrors, officialMediaMirrors} from '../src/data/mirrors.ts';
import {channelsSchema, contributorRolesSchema, costsSchema, DATA_LOCALES, mirrorsSchema, officialMirrorsSchema, sponsorsSchema} from '../src/data/schemas.ts';
import {readYaml} from '../src/data/yaml.ts';

const failures = [];
const fail = message => failures.push(message);
const same = (where, actual, expected) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) fail(`${where}: computed ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
};

// TODO(cutover): remove the fixture overrides after master includes these cost corrections and scripts/baseline/costs.json is regenerated.
const corrections = JSON.parse(readFileSync(new URL('./fixtures/cost-corrections.json', import.meta.url), 'utf8'));

const {pages} = JSON.parse(readFileSync(new URL('./baseline/costs.json', import.meta.url), 'utf8'));

const SCHEMAS = {
  'data/contributor-roles.json': contributorRolesSchema,
  'data/gz_costs.yaml': costsSchema,
  'data/gz_mirrors.yaml': mirrorsSchema,
  'src/data/official-mirrors.json': officialMirrorsSchema,
  'data/gz_channels.yaml': channelsSchema,
  'data/gz_sponsors.yaml': sponsorsSchema,
};
const data = {};
for (const [path, schema] of Object.entries(SCHEMAS)) {
  const result = schema.safeParse(path.endsWith('.json') ? JSON.parse(readFileSync(path, 'utf8')) : readYaml(path));
  if (result.success) data[path] = result.data;
  else for (const issue of result.error.issues) fail(`${path}: ${issue.path.join('.')}: ${issue.message}`);
}

// Parity with Hugo's costs page, as of the day that page was built.
const LANGUAGE_TAG = {'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW', en: 'en'};
const hugo = (where, baseline, computed) => same(where, computed, baseline);
const numbers = text => text.match(/\d[\d,]*(?:\.\d+)?/g) ?? [];
const costs = data['data/gz_costs.yaml'];
if (costs != null) {
  for (const [locale, page] of Object.entries(pages)) {
    same(`${locale} correction date`, page.asOf, corrections.asOf);
    const computed = costReport(costs, page.asOf);
    const fmt = (value, currency) => formatAmount(value, currency, LANGUAGE_TAG[locale]);
    const local = money => ['CNY', 'TWD', 'HKD'].map(currency => fmt(money[currency], currency));
    const paid = (row, values) => (row.price === 'paid' ? values : []);
    const price = row => paid(row, [String(row.amount)]);
    const rowHugo = (row, table, index, field, baseline, actual) => {
      const correction = corrections.rows[row.key]?.[field];
      const expected = field === 'spec' ? correction?.[locale] : correction;
      hugo(`${locale} ${table} row ${index + 1} ${field}`, expected ?? baseline, actual);
    };
    const totalHugo = (field, baseline, actual) => {
      hugo(`${locale} ${field}`, corrections.totals[field] ?? baseline, actual);
    };

    totalHugo('summary total', numbers(page.stats[0][0]), [fmt(computed.totals.all.USD, 'USD')]);
    totalHugo('summary converted', numbers(page.stats[0][1]), local(computed.totals.all));
    totalHugo('summary monthly', numbers(page.stats[1][0]), [fmt(computed.monthlyUsd, 'USD')]);

    hugo(`${locale} specs rows`, page.specs.rows.length, computed.active.length);
    hugo(`${locale} ledger rows`, page.ledger.rows.length, computed.active.length);
    hugo(`${locale} retired rows`, page.retired.rows.length, computed.retired.length);
    computed.active.forEach((row, index) => {
      const [, spec, priceCell, start] = page.specs.rows[index] ?? [];
      rowHugo(row, 'specs', index, 'spec', spec, row.spec[locale]);
      rowHugo(row, 'specs', index, 'price', numbers(priceCell ?? ''), price(row));
      rowHugo(row, 'specs', index, 'start', start, row.start);
      const [, ledgerPrice, periods, accumulated, converted] = page.ledger.rows[index] ?? [];
      rowHugo(row, 'ledger', index, 'price', numbers(ledgerPrice ?? ''), price(row));
      rowHugo(row, 'ledger', index, 'paid', numbers(periods ?? ''), paid(row, [String(row.periods)]));
      rowHugo(row, 'ledger', index, 'accumulated', numbers(accumulated ?? ''), paid(row, [fmt(row.accumulated.USD, 'USD')]));
      rowHugo(row, 'ledger', index, 'converted', numbers(converted ?? ''), paid(row, local(row.accumulated)));
    });
    computed.retired.forEach((row, index) => {
      const [, spec, priceCell, inService, periods, accumulated] = page.retired.rows[index] ?? [];
      rowHugo(row, 'retired', index, 'spec', spec, row.spec[locale]);
      rowHugo(row, 'retired', index, 'price', numbers(priceCell ?? ''), price(row));
      rowHugo(row, 'retired', index, 'in service', inService, `${row.start} – ${row.end}`);
      rowHugo(row, 'retired', index, 'paid', numbers(periods ?? ''), paid(row, [String(row.periods)]));
      rowHugo(row, 'retired', index, 'accumulated', numbers(accumulated ?? ''), paid(row, [fmt(row.accumulated.USD, 'USD')]));
    });
    const [, monthly, , activeTotal, activeConverted] = page.ledger.foot;
    totalHugo('ledger monthly', numbers(monthly), [fmt(computed.monthlyUsd, 'USD')]);
    totalHugo('ledger total', numbers(activeTotal), [fmt(computed.totals.active.USD, 'USD')]);
    totalHugo('ledger converted', numbers(activeConverted), local(computed.totals.active));
    totalHugo('retired subtotal', numbers(page.retired.foot[2]), [fmt(computed.totals.retired.USD, 'USD')]);
  }
}

// Billing rules at the edges the costs page does not reach today.
const PERIODS = [
  ['2026-01-31', '2026-02-28', 'monthly', 1],
  ['2026-01-31', '2026-03-01', 'monthly', 2],
  ['2026-06-10', '2026-06-09', 'monthly', 0],
  ['2025-11-29', '2026-11-28', 'yearly', 1],
  ['2025-11-29', '2026-11-29', 'yearly', 2],
];
for (const [start, until, period, expected] of PERIODS) {
  same(`periodsBetween(${start}, ${until}, ${period})`, periodsBetween(start, until, period), expected);
}

if (costs != null) {
  const corrected = costReport(costs, corrections.asOf);
  for (const [key, expected] of Object.entries(corrections.payments)) {
    const row = corrected.active.find(row => row.key === key);
    const actual = row == null ? undefined : {
      amount: row.amount,
      ...(expected.periods == null ? {} : {periods: row.periods}),
      ...(expected.accumulated == null ? {} : {accumulated: {USD: row.accumulated.USD}}),
      ...(expected.approx == null ? {} : {approx: row.approx}),
      expires: row.expires,
    };
    same(`confirmed payment ${key}`, actual, expected);
  }
}

// Recorded payments include advance renewals; future builds must not invent another payment.
if (costs != null) {
  const renewal = {...costs.items.find(item => item.key === 'domain'), amount: 11.84, paidAmounts: [7.98, 11.84]};
  for (const date of ['2026-10-16', '2027-11-30']) {
    const row = costReport({...costs, items: [renewal]}, date).active[0];
    same(`prepaid renewal ${date} periods`, row.periods, 2);
    same(`prepaid renewal ${date} USD`, formatAmount(row.accumulated.USD, 'USD', 'en'), '19.82');
  }
  const euro = costReport({...costs, items: [{...renewal, currency: 'EUR'}]}, '2026-10-16').active[0];
  same('prepaid EUR conversion', formatAmount(euro.accumulated.USD, 'USD', 'en'), '22.84');
}

// Mirror order: every mirror once, the language's default first, the origin last unless it is the default.
const mirrors = data['data/gz_mirrors.yaml'];
for (const set of mirrors == null ? [] : Object.keys(mirrors)) {
  for (const locale of DATA_LOCALES) {
    const order = mirrorOrder(mirrors, set, locale);
    const chosen = defaultMirror(mirrors, set, locale);
    const where = `mirrorOrder(${set}, ${locale})`;
    same(`${where} members`, order.map(m => m.uri).sort(), mirrors[set].map(m => m.uri).sort());
    same(`${where} first`, order[0], chosen);
    const origin = mirrors[set].find(m => m.origin);
    if (origin != null && origin !== chosen) same(`${where} last`, order.at(-1), origin);
  }
}

if (mirrors != null && data['src/data/official-mirrors.json'] != null) {
  const rows = officialMirrors(mirrors);
  same('official mirror URLs are unique', new Set(rows.map(row => row.uri)).size, rows.length);
  same('official media covers the overview', officialMediaMirrors(mirrors).map(row => row.id).sort(), rows.map(row => row.id).sort());
  for (const [protocol, set] of [['git', 'gentoo_git'], ['rsync', 'gentoo_rsync']]) {
    same(`official ${protocol} sources`, rows.flatMap(row => row[protocol] == null ? [] : [row[protocol].source]).sort(), mirrors[set].filter(row => !row.origin).map(row => row.source).sort());
  }
}

report('check:data', failures);
