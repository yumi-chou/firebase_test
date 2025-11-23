import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDcdu_39CG8jHUpGNtXOi2I6BiTc90z7K4",
  authDomain: "resrv-afe11.firebaseapp.com",
  projectId: "resrv-afe11",
  storageBucket: "resrv-afe11.firebasestorage.app",
  messagingSenderId: "835409265106",
  appId: "1:835409265106:web:de4e5eb9f3fc84c1e6c80b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
