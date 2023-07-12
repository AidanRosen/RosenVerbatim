// import { initializeApp } from "./node_modules/firebase/app"; // Import the functions you need from the SDKs you need
// import { getAnalytics } from "./node_modules/firebase/analytics";
// import { getStorage, ref } from "./node_modules/firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBbjU9XMT-eDQkx0SUyUDg4b1tESDIclM8",
  authDomain: "fir-test-b45a9.firebaseapp.com",
  databaseURL: "https://fir-test-b45a9-default-rtdb.firebaseio.com",
  projectId: "fir-test-b45a9",
  storageBucket: "fir-test-b45a9.appspot.com",
  messagingSenderId: "669522153824",
  appId: "1:669522153824:web:db04f04f333b83f4bc8e05",
  measurementId: "G-L254WQGWQQ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
//var audioUploadDB = firebaseConfig.database().ref('audioUploads') //Creates the database if none exist 

// document.getElementByID("uploadRecording").addEventListener('submit', submitForm)

// function submitForm(e){

//     e.preventDefault();

// }


// Create a root reference
//const storage = getStorage();

function test(testMe){

    console.log(testMe);
}
// window.test = test;

// function createStorageRef(refName){

//     return ref(storage, refName);

// }

function uploadAudio(fileName, file){ //Gear this to uploadBytes if doesn't already work

    let storageRef = firebase.storage().ref("audio/"+fileName);
    let uploadTask = storageRef.put(file); 
    uploadTask.on("state_changed", (snapshot) => {

        console.log("snapshot");

    },(error)=>{

        console.log("error is ", error); 
    })
}



//Notes: check rules according to upload image video if glitch happens with firebase 