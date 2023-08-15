import logo from './logo.svg';
import './App.css';
import AudioManager from './components/AudioManager';
import Recorder from './components/Recorder';
import React from 'react';

function App() {
  return (
    <div className="App">
      <AudioManager />
      <Recorder />
    </div>
  );
}

export default App;
