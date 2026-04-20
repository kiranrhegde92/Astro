#!/usr/bin/env node
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'cosmicself-53568' });

async function main() {
  const db = admin.firestore();
  const codes = await db.collection('referralCodes').get();
  let touched = 0;
  for (const doc of codes.docs) {
    const d = doc.data();
    if (typeof d.inviterDisplayName === 'string') continue;
    const uid = d.inviterUid;
    if (!uid) continue;
    try {
      const user = await admin.auth().getUser(uid);
      const name = user.displayName || (user.email ? user.email.split('@')[0] : 'A friend');
      await doc.ref.update({ inviterDisplayName: name });
      touched += 1;
    } catch (e) {
      console.warn(`skip ${doc.id}:`, e.message);
    }
  }
  console.log(`updated ${touched} referral codes`);
}

main().catch((e) => { console.error(e); process.exit(1); });
