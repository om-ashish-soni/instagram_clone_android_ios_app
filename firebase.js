// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBQphFALgBSWDhF5o7MoDCROUxTijMYkyw",
  authDomain: "instagram-clone-by-om-soni.firebaseapp.com",
  projectId: "instagram-clone-by-om-soni",
  storageBucket: "instagram-clone-by-om-soni.appspot.com",
  messagingSenderId: "884085208284",
  appId: "1:884085208284:web:ba0accff1481fa7df8f019",
  measurementId: "G-2Q9X8MXH4T"
};

// Initialize Firebase
const app=firebase.initializeApp(firebaseConfig);
const db=getFirestore(app);
const auth=firebase.auth();
const provider=new firebase.auth.GoogleAuthProvider();
const storage = getStorage(app);
export {auth,provider,storage};
export default db;