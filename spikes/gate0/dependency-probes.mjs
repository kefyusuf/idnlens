import { isIP } from 'node:net';
import tr46 from 'tr46';
import { parse } from 'tldts';

const rejectIdna = Object.freeze({ accepted: false, asciiHostname: null, unicodeHostname: null });
const rejectPsl = Object.freeze({ supported: false, registrableDomain: null, publicSuffix: null, subdomain: null, suffixKind: null });

const strictOptions = Object.freeze({
  checkBidi: true,
  checkHyphens: true,
  checkJoiners: true,
  ignoreInvalidPunycode: false,
  transitionalProcessing: false,
  useSTD3ASCIIRules: true,
  verifyDNSLength: true,
});

export function probeTr46Idna(input) {
  if (typeof input !== 'string' || input.length === 0 || input.length > 254) return rejectIdna;
  if (/[\\/:?#@%\s]/u.test(input)) return rejectIdna;
  const hostname = input.endsWith('.') ? input.slice(0, -1) : input;
  if (!hostname || hostname.startsWith('.') || hostname.includes('..')) return rejectIdna;
  const ascii = tr46.toASCII(hostname, strictOptions);
  if (!ascii || ascii.length > 253 || isIP(ascii)) return rejectIdna;
  const labels = ascii.split('.');
  if (labels.length < 2 || labels.some((label) => label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/u.test(label))) return rejectIdna;
  const decoded = tr46.toUnicode(ascii, strictOptions);
  if (decoded.error || !decoded.domain || tr46.toASCII(decoded.domain, strictOptions) !== ascii) return rejectIdna;
  return { accepted: true, asciiHostname: ascii, unicodeHostname: decoded.domain };
}

export function probePsl(input) {
  const host = probeTr46Idna(input);
  if (!host.accepted) return rejectPsl;
  const result = parse(host.asciiHostname, {
    allowIcannDomains: true,
    allowPrivateDomains: true,
    extractHostname: false,
    validateHostname: true,
    detectIp: true,
  });
  const suffixKind = result.isPrivate ? 'PRIVATE' : result.isIcann ? 'ICANN' : null;
  if (!suffixKind || !result.domain || !result.publicSuffix) return rejectPsl;
  return {
    supported: true,
    registrableDomain: result.domain,
    publicSuffix: result.publicSuffix,
    subdomain: result.subdomain || '',
    suffixKind,
  };
}
