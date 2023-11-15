import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase} from 'firebase/database';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {

  apiKey: "AIzaSyC9YgItYh2iOnANoO7u3GfSMu_ja5zdLRI",

  authDomain: "pd26s-cch-firebase.firebaseapp.com",

  projectId: "pd26s-cch-firebase",

  storageBucket: "pd26s-cch-firebase.appspot.com",

  messagingSenderId: "1099053314089",

  appId: "1:1099053314089:web:b33896e69af24ce936ac38"

};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const database = getDatabase(app);

const storage = getStorage(app);

export { auth, database, storage };