// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD24vdaH8e-2mWpTkBb0BCRl_dJj6YgDSI",
  authDomain: "rehabilitationai.firebaseapp.com",
  projectId: "rehabilitationai",
  storageBucket: "rehabilitationai.firebasestorage.app",
  messagingSenderId: "94680599032",
  appId: "1:94680599032:web:fbe005d7d79bde25e8ee0d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Експорт авторизації, щоб використовувати в інших файлах
export const auth = getAuth(app);