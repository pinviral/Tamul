import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration is baked in during build via vite.config.ts
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.FIREBASE_APP_ID || "",
};

// Strict check: Firebase API keys usually start with 'AIza'
// Also check if the value is literally the string "undefined" which can happen with some build tools
const isFirebaseConfigured = typeof firebaseConfig.apiKey === 'string' && 
                             firebaseConfig.apiKey.length > 10 &&
                             firebaseConfig.apiKey.startsWith('AIza') && 
                             !!firebaseConfig.projectId &&
                             firebaseConfig.projectId !== "undefined";

if (!isFirebaseConfigured) {
  console.warn("Firebase is not configured yet. Authentication and Database features will be disabled until API keys are added to Netlify.");
}

// Only initialize if we have a valid-looking key to avoid 'auth/invalid-api-key' crash
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

// Determine the database ID. If it's an internal AI Studio ID (starts with ai-studio-), 
// it's likely a leftover from a remix and should be '(default)' for a standard Firebase project.
const getDatabaseId = () => {
  const envId = process.env.FIREBASE_DATABASE_ID;
  if (envId && envId !== "undefined") {
    if (envId.startsWith('ai-studio-')) return '(default)';
    return envId;
  }
  return '(default)';
};

export const db = app ? getFirestore(app, getDatabaseId()) : null as any;
export const auth = app ? getAuth(app) : null as any;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
