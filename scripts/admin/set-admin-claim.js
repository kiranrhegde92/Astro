const admin = require('../../functions/node_modules/firebase-admin');
const path = require('path');
const fs = require('fs');

if (!admin.apps.length) {
  // When running locally, authenticate via a service account key file.
  // Priority:
  //   1. GOOGLE_APPLICATION_CREDENTIALS env var (path to key JSON)
  //   2. scripts/admin/serviceAccountKey.json  (gitignored local file)
  //   3. Application Default Credentials (works inside GCP only)
  const keyEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const keyLocal = path.resolve(__dirname, 'serviceAccountKey.json');

  if (keyEnv) {
    admin.initializeApp({ credential: admin.credential.cert(keyEnv) });
  } else if (fs.existsSync(keyLocal)) {
    admin.initializeApp({ credential: admin.credential.cert(keyLocal) });
  } else {
    console.error(
      'No service account key found.\n' +
      'Download one from Firebase Console → Project Settings → Service Accounts → Generate new private key\n' +
      'Then either:\n' +
      '  a) Save it as  scripts/admin/serviceAccountKey.json  (already gitignored)\n' +
      '  b) Set env var GOOGLE_APPLICATION_CREDENTIALS=<path-to-key.json>'
    );
    process.exit(1);
  }
}

async function main() {
  const uid = process.argv[2];
  const value = process.argv[3] ?? 'true';

  if (!uid) {
    console.error('Usage: node scripts/admin/set-admin-claim.js <uid> [true|false]');
    process.exit(1);
  }

  const adminValue = String(value).toLowerCase() === 'true';
  await admin.auth().setCustomUserClaims(uid, { admin: adminValue });
  console.log(`${adminValue ? 'Granted' : 'Revoked'} admin claim for ${uid}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
