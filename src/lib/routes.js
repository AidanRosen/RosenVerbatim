import React from "react"

import { createBrowserRouter } from "react-router-dom"
import Login from "../components/auth/Login"
import Layout from "../components/layout"
import DashBoard from "../components/dashboard"
import Register from "../components/auth/Register"
import AudioPlayer from "../components/history/audioPlayer"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout/>,
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
        path: "protected",
        element: <Layout />,
        children: [
            {
              path: "dashboard",
              element: <DashBoard />
            },
            {
              path: "history",
              element: <AudioPlayer tempurl={"https://object.cloud.sdsc.edu/v1/AUTH_8492e628f69a472d965fab8d3c621959/myContainer/home/ubuntu/audio_recordings/UXTHsfANwDZYr6B5ESE5nJ6cZp83/lincoln_gettysburg_address.8eaab0b6-1272-4b9a-832b-9ff92957f4f3.mp3?temp_url_sig=3ebfa4dd9f2737bb5c09e54211f185c68de6dac66464e5ac7c0fb7fea09c888e&temp_url_expires=1692694616"}/>
            }
        ]
      },
    ],
  },
  {
    path: "/test",
    element: "test1"
  }
])
