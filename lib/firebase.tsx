import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore as getFirestoreFromFirebase, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, DocumentData, Firestore } from "firebase/firestore";
import { getStorage as getStorageFromFirebase, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { nanoid } from "nanoid";

let firebaseApp: FirebaseApp | undefined;
let firestoreInstance: Firestore | undefined;
let storageInstance: ReturnType<typeof getStorageFromFirebase> | undefined;

// Initialize Firebase (singleton pattern)
export function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;
  
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
  
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApps()[0];
  }
  
  return firebaseApp;
}

// Get Firestore instance
export function getFirestore() {
  if (!firestoreInstance) {
    const app = getFirebaseApp();
    firestoreInstance = getFirestoreFromFirebase(app);
  }
  return firestoreInstance;
}

// Get Storage instance
export function getStorage() {
  if (!storageInstance) {
    const app = getFirebaseApp();
    storageInstance = getStorageFromFirebase(app);
  }
  return storageInstance;
}

// Market data storage functions
export async function storeMarketMetadata(marketPubkey: string, metadata: any) {
  const db = getFirestore();
  const docRef = doc(collection(db, "markets"), marketPubkey);
  
  try {
    await setDoc(docRef, {
      ...metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error("Error storing market metadata:", error);
    return false;
  }
}

export async function getMarketMetadata(marketPubkey: string) {
  const db = getFirestore();
  const docRef = doc(collection(db, "markets"), marketPubkey);
  
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting market metadata:", error);
    return null;
  }
}

export async function getMarketsByCreator(creatorPubkey: string) {
  const db = getFirestore();
  const marketsRef = collection(db, "markets");
  const q = query(
    marketsRef, 
    where("creatorPubkey", "==", creatorPubkey),
    orderBy("createdAt", "desc")
  );
  
  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting markets by creator:", error);
    return [];
  }
}

// User profile storage functions
export async function storeUserProfile(walletAddress: string, profileData: any) {
  const db = getFirestore();
  const docRef = doc(collection(db, "users"), walletAddress);
  
  try {
    await setDoc(docRef, {
      ...profileData,
      updatedAt: new Date(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error storing user profile:", error);
    return false;
  }
}

export async function getUserProfile(walletAddress: string) {
  const db = getFirestore();
  const docRef = doc(collection(db, "users"), walletAddress);
  
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

// File storage functions
export async function uploadImage(file: File, path: string = "images"): Promise<string> {
  const storage = getStorage();
  const fileId = nanoid();
  const extension = file.name.split(".").pop();
  const fullPath = `${path}/${fileId}.${extension}`;
  const storageRef = ref(storage, fullPath);
  
  try {
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

// AI analysis data storage
export async function storeAIAnalysis(marketPubkey: string, analysisData: any) {
  const db = getFirestore();
  const docRef = doc(collection(db, "marketAnalyses"), marketPubkey);
  
  try {
    await setDoc(docRef, {
      ...analysisData,
      timestamp: new Date(),
    });
    return true;
  } catch (error) {
    console.error("Error storing AI analysis:", error);
    return false;
  }
}

export async function getAIAnalysis(marketPubkey: string) {
  const db = getFirestore();
  const docRef = doc(collection(db, "marketAnalyses"), marketPubkey);
  
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting AI analysis:", error);
    return null;
  }
}

// Leaderboard data
export async function getLeaderboardData(
  timeframe: "all" | "weekly" | "monthly" = "all",
  limitCount: number = 100
) {
  const db = getFirestore();
  const leaderboardRef = collection(db, "leaderboard");
  
  try {
    const q = query(
      leaderboardRef,
      where("timeframe", "==", timeframe),
      orderBy("score", "desc"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error getting ${timeframe} leaderboard data:`, error);
    return [];
  }
} 