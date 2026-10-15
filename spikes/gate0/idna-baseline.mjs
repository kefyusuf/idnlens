import { isIP } from 'node:net';
import { domainToASCII, domainToUnicode } from 'node:url';

const unsupported = Object.freeze({
  accepted: false,
  asciiHostname: null,
  unicodeHostname: null,
});

/**
 * Gate 0 probe of Node's runtime-dependent IDNA conversion, NOT the M0 core.
 * This is a syntax/canonicalization experiment, not a registry validation or
 * UTS #39 homograph detector. Never use it to assert that a host is safe.
 */
export function probeNodeIdna(input) {
  if (typeof input !== 'string' || input.length === 0 || input.length > 254) {
    return unsupported;
  }

  // The M0 API accepts a hostname, never a URL, port or encoded delimiters.
  if (/[\\/:?#@%\s\u0000-\u001F\u007F]/u.test(input)) {
    return unsupported;
  }

  // DNS root dot is normalized explicitly. Other empty labels stay invalid.
  const hostname = input.endsWith('.') ? input.slice(0, -1) : input;
  if (!hostname || hostname.includes('..') || hostname.startsWith('.')) {
    return unsupported;
  }

  const ascii = domainToASCII(hostname);
  if (!ascii || ascii.length > 253 || isIP(ascii) !== 0) {
    return unsupported;
  }

  const labels = ascii.split('.');
  if (labels.length < 2 || labels.some((label) =>
    label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/u.test(label)
  )) {
    return unsupported;
  }

  // DomainToASCII alone can accept malformed-looking A-label spellings.
  const unicode = domainToUnicode(ascii);
  if (!unicode || domainToASCII(unicode) !== ascii) {
    return unsupported;
  }

  return {
    accepted: true,
    asciiHostname: ascii,
    unicodeHostname: unicode,
  };
}
