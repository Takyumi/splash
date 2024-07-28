// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAQRWkV63etf7t2GClB_U-XvEs2SdyJYKE',
  authDomain: 'splash-7e99f.firebaseapp.com',
  projectId: 'splash-7e99f',
  storageBucket: 'splash-7e99f.appspot.com',
  messagingSenderId: '751418611409',
  appId: '1:751418611409:web:ae346b84cabc156cb217f0',
  measurementId: 'G-V3ZFT8K6BW'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
// storage = getStorage(app)
