const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyAgior0H_TbBS_m2dmOqjE0xM5AYDSCC1E",
  authDomain: "gastos-8c74b.firebaseapp.com",
  projectId: "gastos-8c74b",
  storageBucket: "gastos-8c74b.firebasestorage.app",
  messagingSenderId: "1048464863438",
  appId: "1:1048464863438:web:e7295adf8c73732ba6e09f",
  measurementId: "G-R72MTHCC94"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

module.exports = { db };