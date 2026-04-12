const admin = require('../../functions/node_modules/firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
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
