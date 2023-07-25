import logo from './logo.svg';
import './App.css';
import React, { Component, useEffect, useState }  from 'react';
import { db } from "./lib/firebase.js"
import { getDoc, doc } from "firebase/firestore"


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
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/app.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          {data}
        </a>
      </header>
    </div>
  );
}

export default App;
