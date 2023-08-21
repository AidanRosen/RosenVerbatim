import logo from './logo.svg';
import './App.css';
import React, { Component, useEffect, useState }  from 'react';
import { db } from "./lib/firebase.js"
import { getDoc, doc } from "firebase/firestore"
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import { router } from "../src/lib/routes"
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import AudioPlay from './AudioPlay.js';
import AudioPlayer from './components/audioPlayer/audioPlayer';

function App() {
  const [data, setData] = useState();



  useEffect(() => {
    async function getData(col, id) {
      const docSnap = await getDoc(doc(db, col, id));
      if(docSnap.exists()) {
        console.log(docSnap.data())
        setData(docSnap.data().name);
      }
    }

    getData("users", "testId");
  }, [])
  console.log(data);
  // const router = createBrowserRouter([
  //   {
  //     path: "/",
  //     element: "This is the root"
  //   }
  // ]);
  const tempurl = "https://object.cloud.sdsc.edu/v1/AUTH_8492e628f69a472d965fab8d3c621959/myContainer/home/ubuntu/audio_recordings/noisy.wav?temp_url_sig=33cc053ea525af58b8697def14098413b89c62991196d00423f12735af64a28f&temp_url_expires=1691783546"
  return (
  //   <div className="App">
  //     <header className="App-header">
  //       <img src={logo} className="App-logo" alt="logo" />
  //       <p>
  //         Edit <code>{data}</code> and save to reload.
  //       </p>
  //       <a
  //         className="App-link"
  //         href="https://reactjs.org"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         {data}
  //       </a>
  //     </header>
  //   </div>
  // ); 
  // document.getElementById("root").render(
  //   <RouterProvider
  //     router={router}
  //     fallbackElement={"fallback"}
  //   />
  // ));
  <div>
    <RouterProvider router={router}/>
    <AudioPlayer tempurl={tempurl}/>
    {/* <AudioPlay/> */}
  </div>
  
  );
}

export default App;
