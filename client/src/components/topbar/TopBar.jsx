import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./topbar.css";
import { Context } from "../../context/Context";
import axios from "axios";

export default function Topbar() {
  const { user, dispatch } = useContext(Context);
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const PF = "http://localhost:5000/images/";

  useEffect(() => {
    const getCats = async () => {
      const res = await axios.get('/categories');
      setCategories(res.data);
    };
    getCats();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery}`);
    } else {
      navigate("/");
    }
  };

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleCategoriesDropdown = () => {
    setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen);
  };

  const toggleMoreDropdown = () => {
    setIsMoreDropdownOpen(!isMoreDropdownOpen);
  };

  const handleDestinationClick = (destination) => {
    setIsDropdownOpen(false);
    navigate(`/destination?place=${destination}`);
  };

  const handleMoreClick = (page) => {
    setIsMoreDropdownOpen(false);
    navigate(`/${page}`);
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const destinations = ["South America", "Australia", "Kenya", "South Africa"];
  const moreOptions = ["bookmarks", "photos", "profile"];

  return (
    <div className="top">
      <div className="topContainer">
        <div className="left">
          <span className="topTitle">Voyager</span>
        </div>
        <div className="center">
          <ul className={`topList ${isMenuOpen ? "open" : ""}`}>
            <li className="topMostListContainer">
              <Link className="link" to="/">
                HOME
              </Link>
            </li>
            <li className="topMostListContainer" onClick={toggleDropdown}>
              Destination <i className={`arrow ${isDropdownOpen ? "up" : "down"}`}></i>
              {isDropdownOpen && (
                <ul className="dropdownMenu">
                  {destinations.map((destination) => (
                    <li
                      key={destination}
                      className="dropdownItem"
                      onClick={() => handleDestinationClick(destination)}
                    >
                      {destination}
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li className="topMostListContainer" onClick={toggleCategoriesDropdown}>
              Categories <i className={`arrow ${isCategoriesDropdownOpen ? "up" : "down"}`}></i>
              {isCategoriesDropdownOpen && (
                <ul className="dropdownMenu">
                  {categories.map((category) => (
                    <Link to={`/?cat=${category.name}`} className="link" key={category._id}>
                      <li className="dropdownItem">{category.name}</li>
                    </Link>
                  ))}
                </ul>
              )}
            </li>
            <li className="topMostListContainer">
              <Link className="link" to="/write">
                CREATE
              </Link>
            </li>
            <li className="topMostListContainer" onClick={toggleMoreDropdown}>
              More <i className={`arrow ${isMoreDropdownOpen ? "up" : "down"}`}></i>
              {isMoreDropdownOpen && (
                <ul className="dropdownMenu">
                  {moreOptions.map((option) => (
                    <li
                      key={option}
                      className="dropdownItem"
                      onClick={() => handleMoreClick(option)}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
          <button className="menuButton" onClick={handleMenuClick}>
            <i className="fas fa-bars"></i>
          </button>
        </div>
        <div className="right">
          <form className="Search" onSubmit={handleSearch}>
            <button type="submit" className="searchButton">
              <i className="topSearchIcon fas fa-search"></i>
            </button>
            <input
              className="searchInput"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
            />
          </form>
          {user ? (
            <>
              <Link className="link" to="/settings">
                <img
                  className="topImg"
                  src={user.profilePic ? PF + user.profilePic : "https://images.pexels.com/photos/6685428/pexels-photo-6685428.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"}
                  alt="user"
                />
              </Link>
              <li className="topListItem logOut" onClick={handleLogout}>
                LOGOUT
              </li>
            </>
          ) : (
            currentPath !== "/login" &&
            currentPath !== "/register" && (
              <ul className="topList">
                <li className="topMostListContainer">
                  <Link className="loginLink" to="/login">
                    LOGIN
                  </Link>
                </li>
                <li className="topMostListContainer">
                  <Link className="registerLink" to="/register">
                    REGISTER
                  </Link>
                </li>
              </ul>
            )
          )}
        </div>
      </div>
    </div>
  );
}
