import './App.css';
import React from 'react';

import { BrowserRouter as Router, Routes, Route, RouterProvider } from 'react-router-dom';

import {router} from './lib/routes'



function App() {

  return (

	<div className='App'>
		<RouterProvider router={router}/>
	</div>
	
  );
}

export default App;
