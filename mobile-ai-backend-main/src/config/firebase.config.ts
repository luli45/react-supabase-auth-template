import { initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

let firebaseApp: App | null = null;
let firebaseAuth: Auth | null = null;

function initializeFirebase(): { app: App; auth: Auth } | null {
  if (firebaseApp && firebaseAuth) {
    return { app: firebaseApp, auth: firebaseAuth };
  }

  let serviceAccount;
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const parsedConfig = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      if (parsedConfig.private_key) {
        parsedConfig.private_key = parsedConfig.private_key.replace(/\\n/g, '\n');
      }
      serviceAccount = parsedConfig;
    } else {
      const localPath = path.join(__dirname, '../../firebase-service-account.json');
      if (fs.existsSync(localPath)) {
        serviceAccount = require(localPath);
      } else {
        console.warn('Firebase service account not configured. Firebase auth will be disabled.');
        return null;
      }
    }

    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
    });
    firebaseAuth = getAuth(firebaseApp) as Auth;
    return { app: firebaseApp, auth: firebaseAuth };
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
    return null;
  }
}

export { initializeFirebase, firebaseApp, firebaseAuth };
