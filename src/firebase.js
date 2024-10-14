import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAXdvPbrFzZHbpBWFoT7vIf8_SecjTmgxY",
    authDomain: "poke-quest-547ef.firebaseapp.com",
    projectId: "poke-quest-547ef",
    storageBucket: "poke-quest-547ef.appspot.com",
    messagingSenderId: "57037074571",
    appId: "1:57037074571:web:41ad240e42bdda4378a48e"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  export { auth, db };