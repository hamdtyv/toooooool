import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfigParams from '../firebase-applet-config.json';
const firebaseConfig = firebaseConfigParams as any;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

// Provider definition
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/tasks');
googleProvider.addScope('https://www.googleapis.com/auth/gmail');

// Access Token cache
export let cachedAccessToken: string | null = null;
export const getAccessToken = () => cachedAccessToken;

let activeSignInPromise: Promise<FirebaseUser | null> | null = null;


// Operation Types enum
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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

/**
 * Handle Firestore Insufficient Permissions / Quota Errs strictly
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 1. Validate Connection to Firestore at startup
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Sign In With Google Popup
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  if (activeSignInPromise) {
    return activeSignInPromise;
  }

  activeSignInPromise = (async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      cachedAccessToken = credential?.accessToken || null;
      const user = result.user;
      
      // Write public user profile to Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: user.metadata.creationTime || new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
      return user;
    } catch (error: any) {
      if (
        error?.code === 'auth/cancelled-popup-request' || 
        error?.code === 'auth/popup-closed-by-user' ||
        error?.message?.includes('cancelled-popup-request') ||
        error?.message?.includes('popup-closed-by-user')
      ) {
        console.warn("Google authentication popup closed/cancelled by the user or system:", error);
        return null; // Resolve cleanly
      }
      console.error("Google Auth failed", error);
      throw error;
    } finally {
      activeSignInPromise = null;
    }
  })();

  return activeSignInPromise;
}

// Log Out
export async function logOut() {
  await signOut(auth);
  cachedAccessToken = null;
}

// Log an action for a tool
export async function logToolActivity(
  toolId: string,
  toolName: string,
  action: string,
  payload: Record<string, any>,
  description?: string
) {
  const currentUser = auth.currentUser;
  if (!currentUser) return; // Only log for authenticated users

  const logId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  const path = 'activity_logs';
  try {
    await setDoc(doc(db, path, logId), {
      id: logId,
      userId: currentUser.uid,
      toolId,
      toolName,
      action,
      timestamp: new Date().toISOString(),
      payload,
      description: description || ''
    });
  } catch (error) {
    console.warn("Failed to write activity log: ", error);
    // Silent catch so it doesn't break the parent tool execution, but standard handling is available
  }
}

// Fetch Activity Logs for a specific tool (or all if empty) for the current user
export async function fetchToolActivityLogs(toolId?: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const path = 'activity_logs';
  try {
    let q = query(
      collection(db, path),
      where('userId', '==', currentUser.uid)
    );
    
    if (toolId) {
      q = query(
        collection(db, path),
        where('userId', '==', currentUser.uid),
        where('toolId', '==', toolId)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const logs: any[] = [];
    querySnapshot.forEach((doc) => {
      logs.push(doc.data());
    });
    
    // Sort descending by timestamp locally since Firestore does not have auto-indexed ordering on composite fields without specific setup
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, path);
  }
}
