import logo from './logo.svg';
import './App.css';
import React, { Component }  from 'react';
// import AudioPlay from './AudioPlay.js';
// import AudioPlayer from './components/audioPlayer/audioPlayer';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route }
	from 'react-router-dom';
import Home from './pages';
import AudioPlay from './AudioPlay';
import AudioManager from './components/AudioManager';
import Forgotpassword from './pages/forgotpassword';
import Homepage from './pages/homepage';
import Login from './pages/login';
import SignUp from './pages/signup';
import History from './pages/History';



function App() {
  return (
    // -- COMMENT THIS OUT FOR NOW AND MOVE TO ITS OWN PAGE
    // <div className="App">
    //   <AudioPlay />
    // </div>
		<Router>
			<Navbar />
			<Routes>
				<Route exact path='/' exact element={<Home />} />
				<Route path='/audioplay' element={<AudioPlay />} />
				<Route path='/audiomanager' element={<AudioManager />} />
				<Route path='/forgotpassword' element={<Forgotpassword />} />
				<Route path='/homepage' element={<Homepage />} />
				<Route path='/login' element={<Login />} />
				<Route path='/signup' element={<SignUp />} />
				<Route path='/History' element={<History />} />
			</Routes>
		</Router>
  );
}

export default App;
