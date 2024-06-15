import { Link } from "react-router-dom";
import "./login.css";
import { useContext, useRef } from "react";
import { Context } from "../../context/Context";
import axios from "axios";

export default function Login() {
  const userRef = useRef();
  const passwordRef = useRef();
  const { dispatch, isFetching } = useContext(Context);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: "LOGIN_START" });
    try {
      const res = await axios.post("/auth/login", {
        username: userRef.current.value,
        password: passwordRef.current.value,
      });
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
      window.location.replace("/"); // Redirect to home page after successful login
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE" });
      console.error("Login error:", err);
    }
  };

  return (
    <div className="login">
      <div className="dark">
        <i className="loginIcon fa-solid fa-plane-departure"></i>
        <span className="loginTitle">Voyager</span>
        <form className="loginForm" onSubmit={handleSubmit}>
          <label htmlFor="loginEmail">Username</label>
          <input
            id="loginEmail"
            className="loginInput"
            type="text"
            placeholder="Enter your username..."
            ref={userRef}
          />
          <label htmlFor="loginPassword">Password</label>
          <input
            id="loginPassword"
            className="loginInput"
            type="password"
            placeholder="Enter your password..."
            ref={passwordRef}
          />
          <button className="loginButton" type="submit" disabled={isFetching}>
            Login
          </button>
        </form>
        <span htmlFor="loginEmail">Are you new here?</span>
        <button className="loginRegisterButton">
          <Link className="link" to="/register">
            Register
          </Link>
        </button>
      </div>
    </div>
  );
}
