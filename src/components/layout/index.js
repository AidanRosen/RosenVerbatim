import { Outlet, useLocation, useNavigate } from "react-router-dom"
import React, { useEffect } from "react"
import { useAuth } from "../../hooks/auth"

export default function Layout() {
    const location = useLocation();
    const {user, isLoading} = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        console.log(location.pathname.startsWith("/protected"));
        console.log(!user);
        if(location.pathname.startsWith("/protected") && !user) {
            navigate("/login");
        }
    }, [location.pathname, user]);

    if(isLoading) return "Currently Loading...";

    return (
        <>This is the child element: <Outlet/> </>
    )
}
