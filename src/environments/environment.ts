// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyCqcJrOhOKpVrI1jYRcZ_r9JFhpdSuB2Xk",
	authDomain: "global-next-3a620.firebaseapp.com",
	projectId: "global-next-3a620",
	storageBucket: "global-next-3a620.firebasestorage.app",
	messagingSenderId: "1090986574343",
	appId: "1:1090986574343:web:023ba899a54c1f646420a2",
	measurementId: "G-C7EHQ6NN7M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


