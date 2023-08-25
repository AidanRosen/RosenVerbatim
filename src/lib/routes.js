import logo from '../logo.svg';
import '../App.css';
import React, { Component }  from 'react';
// import AudioPlay from './AudioPlay.js';
// import AudioPlayer from './components/audioPlayer/audioPlayer';
import { createBrowserRouter, } from "react-router-dom"
import Navbar from '../components/Navbar';
import { BrowserRouter as Router, Routes, Route, Navigate }
	from 'react-router-dom';
import Home from '../pages';
import AudioPlay from '../AudioPlay';
import AudioManager from '../components/AudioManager';
import Forgotpassword from '../pages/forgotpassword';
import Homepage from '../pages/homepage';
import Login from '../components/auth/login';
import Register from '../components/auth/register';
import History from '../pages/History';
import Layout from '../components/layout';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navbar/>,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />
      },
      {
        path: "forgotpassword",
        element: <Forgotpassword/>
      },
      {
        index: true,
        path: "home",
        element: <Home/>
      },
      {
        path: '/', // This is the default route path
        element: <Navigate to="/home" />, // Redirect to the "home" route
      },
      {
        path: "protected",
        element: <Navbar />,
        children: [
            {
                path: "audiomanager",
                element: <AudioManager />
            },
            {
                path: "history",
                element: <History/>
            }
        ]
      },
    ],
  }
])
