import { useContext } from "react";
import { NavLink } from "react-router";
import { AuthContext } from "../../context/auth-context";
import './NavLinks.css'

const NavLinks = () => {
    const { isLoggedIn, logout, receivedRequests } = useContext(AuthContext)



    return (
        <ul className="nav-links">
            {isLoggedIn && <li>
                <NavLink to="/feed">Feed</NavLink>    
            </li>}
            {isLoggedIn && <li>
                <NavLink to="/myjournals">My Journals</NavLink>    
            </li>}
            {isLoggedIn && <li>
                <NavLink to="/newjournal">Add Journal</NavLink>    
            </li>}
            {isLoggedIn && <li>
                <NavLink to="/friends">My Friends</NavLink>
            </li>}
            {isLoggedIn && <li>
                <NavLink to="/requests">
                    Requests
                    {receivedRequests && receivedRequests.length > 0 && (
                        <span className="nav-badge">{receivedRequests.length}</span>
                    )}
                </NavLink>
            </li>}
            {isLoggedIn && <li>
                <NavLink to="/search">Search</NavLink>
            </li>}
            {isLoggedIn && <li>
                <button onClick={logout}>Logout</button>
            </li>}
        </ul>
    )
}

export default NavLinks