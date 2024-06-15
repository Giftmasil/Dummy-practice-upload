import { useEffect, useState } from "react"
import "./sidebar.css"
import axios from "axios"
import { Link } from "react-router-dom"

export default function Sidebar() {
  const [cats, setCats] = useState([])

  useEffect(()=>{
    const getCats = async () => {
      const res = await axios.get('/categories')
      setCats(res.data)
    }
    getCats()
  },[])

  return (
    <div className="sidebar">
      <div className="sidebarItem">
        <span className="sidebarTitle">ABOUT US</span>
        <img
          src="https://images.unsplash.com/photo-1716384953735-be258c0aa9e4?q=80&w=1895&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="about"
        />
        <p>Welcome to Voyager, where every journey begins with a story waiting to unfold.At Voyager, we believe in the transformative power of travel. It's not just about ticking off bucket list items; it's about immersing yourself in cultures, tasting local flavors, and creating memories that last a lifetime. From pristine beaches to bustling cityscapes, tranquil mountains to vibrant festivals, our goal is to inspire and guide you on your next adventure.</p>
      </div>
      <div className="sidebarItem">
        <span className="sidebarTitle">CATEGORIES</span>
        <ul className="sidebarList">
          {cats.map((c) => (
            <Link to={`/?cat= ${c.name}`} className="link" key={c._id}>
              <li className="sidebarListItem">{c.name}</li>
            </Link>
          ))}
        </ul>
      </div>
      <div className="sidebarItem">
        <span className="sidebarTitle">FOLLOW US</span>
      </div>
      <div className="sidebarSocial">
        <a href="https://www.facebook.com/TheDummyPage/"><i className="topIcon fab fa-facebook-square"></i></a>
        <a href="https://www.instagram.com/_mas.ila_/"><i className="topIcon fab fa-instagram-square"></i></a>
        <a href="https://www.pinterest.com/fakepinterest/"><i className="topIcon fab fa-pinterest-square"></i></a>
        <a href="https://twitter.com/_muuo11_"><i className="topIcon fab fa-twitter-square"></i></a>
      </div>
    </div>
  )
}
