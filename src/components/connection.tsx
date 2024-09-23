// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from 'firebase/app'
import { Firestore, getFirestore } from 'firebase/firestore'
import { Auth, getAuth } from "firebase/auth";
import firebaseui from 'firebaseui';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAQRWkV63etf7t2GClB_U-XvEs2SdyJYKE",
  authDomain: "splash-7e99f.firebaseapp.com",
  projectId: "splash-7e99f",
  storageBucket: "splash-7e99f.appspot.com",
  messagingSenderId: "751418611409",
  appId: "1:751418611409:web:1810681dd1482b41b217f0",
  measurementId: "G-C4MKB9GNYW"
}

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig)
export const db: Firestore = getFirestore(app)

const auth: Auth = getAuth(app);
const ui = new firebaseui.auth.AuthUI(auth);
// storage = getStorage(app)
