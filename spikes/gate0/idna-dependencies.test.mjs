import assert from 'node:assert/strict';
import test from 'node:test';
import { probeTr46Idna, probePsl } from './dependency-probes.mjs';
import { probeNodeIdna } from './idna-baseline.mjs';

const accepted = [
  ['amazon.com', 'amazon.com', 'amazon.com'],
  ['AMAZON.COM', 'amazon.com', 'amazon.com'],
  ['аmazon.com', 'xn--mazon-3ve.com', 'аmazon.com'],
  ['bücher.de', 'xn--bcher-kva.de', 'bücher.de'],
  ['xn--bcher-kva.de', 'xn--bcher-kva.de', 'bücher.de'],
  ['faß.de', 'xn--fa-hia.de', 'faß.de'],
  ['a.com.', 'a.com', 'a.com'],
];

for (const [input, ascii, unicode] of accepted) {
  test('tr46 strict candidate normalizes ' + JSON.stringify(input), () => {
    assert.deepEqual(probeTr46Idna(input), {
      accepted: true, asciiHostname: ascii, unicodeHostname: unicode,
    });
  });
}

const rejected = [
  'xn--invalid-.com', 'xn--.com', 'a..com', '-bad.com', 'bad-.com',
  'bad_label.com', 'paypal.com:443', 'paypal.com@evil.com',
  'https://amazon.com', 'foo/bar.com', 'a%2ecom', 'localhost',
  '127.0.0.1', '[::1]', 'a\u200Db.com', 'a\u202Eb.com', '\uD800.com',
  'a' + 'b'.repeat(63) + '.com',
];

for (const input of rejected) {
  test('tr46 strict candidate rejects ' + JSON.stringify(input), () => {
    assert.deepEqual(probeTr46Idna(input), {
      accepted: false, asciiHostname: null, unicodeHostname: null,
    });
  });
}

test('tr46 candidate rejects non-strings', () => {
  for (const input of [undefined, null, 42, {}, []]) {
    assert.equal(probeTr46Idna(input).accepted, false);
  }
});

test('tr46 candidate uses nontransitional processing for sharp s', () => {
  assert.equal(probeTr46Idna('faß.de').asciiHostname, 'xn--fa-hia.de');
  assert.notEqual(probeTr46Idna('faß.de').asciiHostname, 'fass.de');
});

test('tr46 candidate and existing baseline agree on common hostname fixtures', () => {
  for (const input of ['amazon.com', 'bücher.de', 'аmazon.com', 'a..com', 'localhost']) {
    assert.deepEqual(probeTr46Idna(input), probeNodeIdna(input));
  }
});

test('PSL candidate resolves compound ICANN suffix without substring trust', () => {
  assert.deepEqual(probePsl('login.paypal.com.attacker.co.uk'), {
    supported: true,
    registrableDomain: 'attacker.co.uk',
    publicSuffix: 'co.uk',
    subdomain: 'login.paypal.com',
    suffixKind: 'ICANN',
  });
});

test('PSL candidate honors private suffixes explicitly', () => {
  assert.deepEqual(probePsl('sub.example.github.io'), {
    supported: true,
    registrableDomain: 'example.github.io',
    publicSuffix: 'github.io',
    subdomain: 'sub',
    suffixKind: 'PRIVATE',
  });
});

test('PSL candidate handles normal and IDN A-label hosts', () => {
  for (const [input, domain] of [
    ['mail.example.com', 'example.com'],
    ['shop.xn--bcher-kva.de', 'xn--bcher-kva.de'],
  ]) {
    const parsed = probePsl(input);
    assert.equal(parsed.supported, true);
    assert.equal(parsed.registrableDomain, domain);
    assert.equal(parsed.suffixKind, 'ICANN');
  }
});

test('PSL candidate treats unknown suffixes and non-DNS hosts as unsupported', () => {
  for (const input of ['abc.definitely-not-an-icann-tld', 'localhost', '127.0.0.1']) {
    const result = probePsl(input);
    assert.equal(result.supported, false);
    assert.equal(result.registrableDomain, null);
  }
});

test('PSL candidate does not assume public suffix alone is registrable', () => {
  const parsed = probePsl('co.uk');
  assert.equal(parsed.supported, false);
  assert.equal(parsed.registrableDomain, null);
});
