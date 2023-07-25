import React from "react"

import { createBrowserRouter } from "react-router-dom"
import Login from "../components/auth/Login"
import Layout from "../components/layout"
import DashBoard from "../components/dashboard"

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
        path: "protected",
        element: <Layout />,
        children: [
            {
                path: "dashboard",
                element: <DashBoard />
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

/**/