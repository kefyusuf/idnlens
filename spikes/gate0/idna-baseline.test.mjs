import assert from 'node:assert/strict';
import test from 'node:test';
import { probeNodeIdna } from './idna-baseline.mjs';

const accepted = [
  ['amazon.com', 'amazon.com', 'amazon.com'],
  ['AMAZON.COM', 'amazon.com', 'amazon.com'],
  ['аmazon.com', 'xn--mazon-3ve.com', 'аmazon.com'],
  ['bücher.de', 'xn--bcher-kva.de', 'bücher.de'],
  ['xn--bcher-kva.de', 'xn--bcher-kva.de', 'bücher.de'],
  ['a.com.', 'a.com', 'a.com'],
];

for (const [input, ascii, unicode] of accepted) {
  test('Node IDNA baseline accepts and canonicalizes ' + JSON.stringify(input), () => {
    const result = probeNodeIdna(input);
    assert.deepEqual(result, {
      accepted: true,
      asciiHostname: ascii,
      unicodeHostname: unicode,
    });
  });
}

const rejected = [
  'xn--invalid-.com', // Node domainToASCII returns a nonempty string; not a valid canonical A-label.
  'xn--.com',
  'a..com',
  '-bad.com',
  'bad-.com',
  'bad_label.com',
  'paypal.com:443',
  'paypal.com@evil.com',
  'https://amazon.com',
  'foo/bar.com',
  'a%2ecom',
  'localhost',
  '127.0.0.1',
  '[::1]',
  'l\u200Dabel.com',
  'a\u202Eb.com',
  '\uD800.com',
  'a' + 'b'.repeat(63) + '.com', // label > 63 octets.
];

for (const input of rejected) {
  test('Node IDNA baseline must not accept ' + JSON.stringify(input), () => {
    const result = probeNodeIdna(input);
    assert.deepEqual(result, {
      accepted: false,
      asciiHostname: null,
      unicodeHostname: null,
    });
  });
}

test('baseline probe never silently accepts non-strings', () => {
  for (const input of [undefined, null, 1, {}, []]) {
    assert.equal(probeNodeIdna(input).accepted, false);
  }
});
