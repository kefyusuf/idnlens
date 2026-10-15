import { readFileSync } from 'node:fs';

const sources = new Map([
  ['https://unicode.org/Public/18.0.0/ucd/extracted/DerivedJoiningType.txt', process.env.IDNLENS_REGEX_JOINING_TYPE_FILE],
  ['https://unicode.org/Public/18.0.0/ucd/extracted/DerivedCombiningClass.txt', process.env.IDNLENS_REGEX_COMBINING_CLASS_FILE],
]);

if ([...sources.values()].some((value) => !value)) {
  throw new Error('All pinned Unicode input files are required for offline replay');
}

// Injected solely into the child generator process. Never make network requests.
globalThis.fetch = async (url) => {
  const path = sources.get(String(url));
  if (!path) {
    throw new Error('Unexpected network request by tagged TR46 regex generator: ' + url);
  }
  return new Response(readFileSync(path), { status: 200 });
};
