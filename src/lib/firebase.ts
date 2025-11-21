import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAci7NGUndm50WQOx3kPzPO5psFQT39aow",
  authDomain: "span-plan-a7411.firebaseapp.com",
  projectId: "span-plan-a7411",
  storageBucket: "span-plan-a7411.firebasestorage.app",
  messagingSenderId: "100102871772",
  appId: "1:100102871772:web:c236a93f07d7568e513219",
  measurementId: "G-L2R7EQGYQD"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
