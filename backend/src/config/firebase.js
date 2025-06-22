const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.resolve(__dirname, 'credencialFirebase.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'viajey-db.firebasestorage.app'
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
