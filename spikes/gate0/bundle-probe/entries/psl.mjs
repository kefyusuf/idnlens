import { parse } from 'tldts';

// Gate 0 measurement-only: use the private PSL section to mirror candidate policy.
export const pslCandidate = (hostname) =>
  parse(hostname, { allowPrivateDomains: true, extractHostname: false }).domain ?? null;
