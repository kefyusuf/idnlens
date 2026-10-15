import tr46 from 'tr46';

// Gate 0 measurement-only: force a real IDNA call to survive tree shaking.
export const idnaCandidate = (hostname) =>
  tr46.toASCII(hostname, { transitionalProcessing: false, useSTD3ASCIIRules: true });
