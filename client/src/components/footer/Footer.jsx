import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="footer">
            <li className="topMostListContainer">
              <Link className="link" to="/">
                HOME
              </Link>
              <Link className="link" to="/write">
                Create
              </Link>
              <Link className="link" to="/settings">
                Profile
              </Link>
            </li>
        </footer>
    )
}