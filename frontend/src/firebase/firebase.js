import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD24vdaH8e-2mWpTkBb0BCRl_dJj6YgDSI",
  authDomain: "rehabilitationai.firebaseapp.com",
  projectId: "rehabilitationai",
  storageBucket: "rehabilitationai.firebasestorage.app",
  messagingSenderId: "94680599032",
  appId: "1:94680599032:web:fbe005d7d79bde25e8ee0d",
};

const app = initializeApp(firebaseConfig);

// Експорт авторизації, щоб використовувати в інших файлах
export const auth = getAuth(app);
// Підключення Firestore для збереження результатів вправ
export const db = getFirestore(app);
