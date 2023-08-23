import { RouterProvider } from 'react-router';
import './App.css';
import AudioManager from './components/AudioManager';
import React from 'react';
import { router } from "../src/lib/routes";
import axios from "axios";

function App() {

  return (
    <div className="App">
      <RouterProvider router ={router}/>
    </div>
  );
}

export default App;
