import firebase from 'firebase'

var firebaseConfig = {
    apiKey: "AIzaSyDGlAzoYuc7RyHok5Er9VpZzgQgVNbif_k",
    authDomain: "flashcrd-b656b.firebaseapp.com",
    projectId: "flashcrd-b656b",
    storageBucket: "flashcrd-b656b.appspot.com",
    messagingSenderId: "328298490160",
    appId: "1:328298490160:web:fc045b5008e76fd99bc0f5",
    measurementId: "G-M23F1L20D9"
}

const fire = firebase.initializeApp(firebaseConfig);

export default fire;