import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut as fbSignOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  serverTimestamp,
  Firestore,
  getDocFromServer
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import { MomentRecord } from "./types";

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Use custom firestoreDatabaseId configured in firebase-applet-config.json
export const db: Firestore = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
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
  };
}

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
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore client appears offline:", error.message);
    }
    return false;
  }
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    throw error;
  }
}

/**
 * Sign in as a test/demo parent if Google Auth popup is blocked by iframe policies
 */
export async function signInAsGuest(): Promise<User> {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error("Anonymous sign-in error:", error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

/**
 * Save a completed moment to Firestore at:
 * users/{uid}/moments/{momentId}
 */
export async function saveCompletedMoment(userId: string, moment: Omit<MomentRecord, "userId">): Promise<string> {
  const pathForWrite = `users/${userId}/moments`;
  try {
    const momentsCol = collection(db, "users", userId, "moments");
    const momentDocRef = doc(momentsCol);
    
    const momentData = {
      ...moment,
      id: momentDocRef.id,
      userId,
      savedAt: serverTimestamp()
    };

    await setDoc(momentDocRef, momentData);
    return momentDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pathForWrite);
  }
}

/**
 * Fetch all completed moments for a specific user
 */
export async function fetchUserMoments(userId: string): Promise<MomentRecord[]> {
  const pathForList = `users/${userId}/moments`;
  try {
    const momentsCol = collection(db, "users", userId, "moments");
    const q = query(momentsCol, orderBy("completedAt", "desc"));
    const snapshot = await getDocs(q);
    
    const moments: MomentRecord[] = [];
    snapshot.forEach((docSnapshot) => {
      moments.push({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<MomentRecord, "id">)
      });
    });
    return moments;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, pathForList);
  }
}

/**
 * Delete a moment record
 */
export async function deleteUserMoment(userId: string, momentId: string): Promise<void> {
  const pathForDelete = `users/${userId}/moments/${momentId}`;
  try {
    const docRef = doc(db, "users", userId, "moments", momentId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, pathForDelete);
  }
}

/**
 * Calculate user streaks and stats from moments
 */
export function calculateStats(moments: MomentRecord[]) {
  const totalMoments = moments.length;
  const outdoorMoments = moments.filter(m => m.locationType === "outdoor").length;
  const indoorMoments = moments.filter(m => m.locationType === "indoor").length;

  let totalMinutes = 0;
  moments.forEach(m => {
    const durationNum = parseInt(m.duration.replace(/\D/g, ""), 10) || 15;
    totalMinutes += durationNum;
  });

  // Calculate streak based on unique active calendar days
  if (moments.length === 0) {
    return {
      totalMoments: 0,
      outdoorMoments: 0,
      indoorMoments: 0,
      currentStreak: 0,
      totalMinutes: 0,
      lastCompletedDate: undefined
    };
  }

  const uniqueDays = Array.from(
    new Set(
      moments.map(m => {
        const d = new Date(m.completedAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    )
  ).sort().reverse();

  // Streak calculation
  let streak = 0;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const hasToday = uniqueDays.includes(todayStr);
  const hasYesterday = uniqueDays.includes(yesterdayStr);

  if (hasToday || hasYesterday) {
    let checkDate = hasToday ? new Date(today) : new Date(yesterday);
    while (true) {
      const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (uniqueDays.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return {
    totalMoments,
    outdoorMoments,
    indoorMoments,
    currentStreak: Math.max(streak, totalMoments > 0 ? 1 : 0),
    totalMinutes,
    lastCompletedDate: moments[0]?.completedAt
  };
}
