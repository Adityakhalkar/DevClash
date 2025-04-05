// lib/firebase-admin.ts
import * as admin from "firebase-admin";

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.applicationDefault(), // or use cert()
    })
  : admin.app();

export const auth = admin.auth();
