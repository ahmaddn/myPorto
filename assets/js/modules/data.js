// ═══════════════════════════════════════════
//  DATA — data.js
// ═══════════════════════════════════════════

import { 
  getData as getFirebaseData, 
  getDocumentById, 
  setData as setFirebaseData,
  clearCollection,
  batchAddData
} from "../firebase-service.js";
import { FIREBASE_CACHE, setCacheLoaded } from "./state.js";
import { DEFAULTS } from "./constants.js";
import { getSessionWithExpiry, cleanExpiredSession } from "./utils.js";
import { MODUL_USER_INFO } from "./state.js";

export async function initData() {
  console.log("🔄 Loading data from Firebase...");
  try {
    const profileDoc = await getDocumentById("profile", "main");
    FIREBASE_CACHE.profile = profileDoc || DEFAULTS.profile;

    const collections = ["skills", "experience", "projects", "films", "music", "books", "games", "modulFiles"];
    for (const col of collections) {
      const data = await getFirebaseData(col);
      FIREBASE_CACHE[col] = (data && data.length) ? data : DEFAULTS[col] || [];
    }

    const settingsDoc = await getDocumentById("settings", "main");
    FIREBASE_CACHE.settings = settingsDoc || { modulVisible: true };

    cleanExpiredSession();
    const savedUserData = getSessionWithExpiry("modulUserInfo");
    if (savedUserData) {
      MODUL_USER_INFO.name = savedUserData.name;
      MODUL_USER_INFO.class = savedUserData.class;
    }

    setCacheLoaded(true);
    return true;
  } catch (error) {
    console.error("Error loading Firebase data:", error);
    setCacheLoaded(true);
    return false;
  }
}

export async function saveData(key, value) {
  try {
    FIREBASE_CACHE[key] = value;
    if (key === "profile") {
      await setFirebaseData("profile", "main", value);
    } else {
      await clearCollection(key);
      if (Array.isArray(value) && value.length > 0) {
        await batchAddData(key, value);
      }
    }
    return true;
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    return false;
  }
}
