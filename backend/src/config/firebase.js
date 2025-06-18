const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.resolve(__dirname, 'credencialFirebase.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

module.exports = { admin, db };
