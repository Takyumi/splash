import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyAQRWkV63etf7t2GClB_U-XvEs2SdyJYKE',
  authDomain: 'splash-7e99f.firebaseapp.com',
  projectId: 'splash-7e99f',
  storageBucket: 'splash-7e99f.appspot.com',
  messagingSenderId: '751418611409',
  appId: '1:751418611409:web:1810681dd1482b41b217f0',
  measurementId: 'G-C4MKB9GNYW'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export { db, auth }

// storage = getStorage(app)
