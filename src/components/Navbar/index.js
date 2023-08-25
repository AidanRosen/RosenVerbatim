import { Nav, NavLink, NavMenu }
	from "./NavbarElements";
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import React, { useEffect } from "react"
import { useAuth } from "../../hooks/auth"

const Navbar = () => {
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
		<>
			<Nav>
				<NavMenu>
					{/* <NavLink to="/about" activeStyle>
						About
					</NavLink> */}
					{/* <NavLink to="/contact" activeStyle>
						Contact Us
					</NavLink>
					<NavLink to="/blogs" activeStyle>
						Blogs
					</NavLink> */}
					{/* <NavLink to="/signup" activeStyle>
						Sign Up
					</NavLink> */}
					
				</NavMenu>
			</Nav>
			<Outlet></Outlet>
		</>
	);
};

export default Navbar;
