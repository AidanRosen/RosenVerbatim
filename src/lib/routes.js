import '../App.css';
import React from 'react';
import { createBrowserRouter, } from "react-router-dom"
import Navbar from '../components/Navbar';
import { BrowserRouter as Router, Routes, Route, Navigate }
	from 'react-router-dom';
import Home from '../pages';
import AudioManager from '../components/AudioManager';
import Forgotpassword from '../pages/forgotpassword';
import Login from '../components/auth/login';
import Register from '../components/auth/register';
import History from '../pages/History';

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
