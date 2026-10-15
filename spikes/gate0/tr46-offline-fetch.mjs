import { readFileSync } from 'node:fs';

const sourcePath = process.env.IDNLENS_TR46_OFFLINE_INPUT;
const allowedUrl = process.env.IDNLENS_TR46_EXPECTED_URL;

if (!sourcePath || !allowedUrl) {
  throw new Error('Offline mapping replay requires source path and pinned URL');
}

// Replace fetch only in the isolated child process running the exact tagged generator.
// No remote requests are allowed during the replay.
globalThis.fetch = async (url) => {
  if (String(url) !== allowedUrl) {
    throw new Error('Unexpected network access by tagged mapping generator: ' + url);
  }
  return new Response(readFileSync(sourcePath), { status: 200 });
};
