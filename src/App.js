import logo from './logo.svg';
import './App.css';
import React, { Component, useEffect, useState }  from 'react';
import { db } from "./lib/firebase.js"
import { getDoc, doc } from "firebase/firestore"
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import { router } from "../src/lib/routes"
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';


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
    <RouterProvider router={router}/>
  )
}

export default App;
