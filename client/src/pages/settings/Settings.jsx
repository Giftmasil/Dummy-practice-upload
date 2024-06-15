import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { Context } from "../../context/Context";
import Post from "../../components/post/Post";
import "./settings.css";

export default function Settings() {
  const { user, dispatch } = useContext(Context);
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notification, setNotification] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [follows, setFollows] = useState([]);
  const [followings, setFollowings] = useState([]);
  const PF = "http://localhost:5000/images/";

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const res = await axios.get(`/posts?user=${user.username}`);
        setUserPosts(res.data);
      } catch (err) {
        console.error("Error fetching user posts:", err);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`/notifications/${user._id}`);
        setNotifications(res.data);
        setUnreadCount(res.data.filter((notif) => !notif.read).length);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    const fetchFollowsAndFollowings = async () => {
      try {
        const followsRes = await axios.get(`/users/${user._id}/followers`);
        const followingsRes = await axios.get(`/users/${user._id}/followings`);
        setFollows(followsRes.data);
        setFollowings(followingsRes.data);
      } catch (err) {
        console.error("Error fetching followers and followings:", err);
      }
    };

    fetchUserPosts();
    fetchNotifications();
    fetchFollowsAndFollowings();
  }, [user.username, user._id]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prevCount) => prevCount - 1);
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: "UPDATE_START" });
    const updatedUser = {
      userId: user._id,
      username,
      email,
      ...(password && { password }), // Update password only if it's not empty
    };
    if (file) {
      const data = new FormData();
      const filename = Date.now() + file.name;
      data.append("name", filename);
      data.append("file", file);
      updatedUser.profilePic = filename;
      try {
        await axios.post("/upload", data);
      } catch (err) {
        console.error("Error uploading file:", err);
      }
    }
    try {
      const res = await axios.put("/users/" + user._id, updatedUser);
      setSuccess(true);
      dispatch({ type: "UPDATE_SUCCESS", payload: res.data });
    } catch (err) {
      dispatch({ type: "UPDATE_FAILURE" });
    }
  };

  return (
    <div className="settings">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ marginBottom: "1rem" }}>My Profile</h1>
        <div onClick={() => setNotification(!notification)}>
          {unreadCount > 0 ? (
            <i className="fa-solid fa-bell" style={{ fontSize: "2rem", color: "green" }}></i>
          ) : (
            <i className="fa-regular fa-bell" style={{ fontSize: "2rem" }}></i>
          )}
        </div>
      </div>
      <div className="settingsIntro">
        <div style={{ marginBottom: "1rem", display: 'flex' }}>
          <img
            className="topMostImage"
            src={file ? URL.createObjectURL(file) : PF + user.profilePic}
            alt="user"
          />
          <div style={{ marginLeft: "20px" }}>
            <p><strong>@{username}</strong></p>
            <p><strong>Conquering the great heights</strong></p>
            <p><strong>Follows: {follows.length}</strong></p>
            <p><strong>Followings: {followings.length}</strong></p>
          </div>
        </div>
        <div>
        {notification && (
          <div className="notificationsDropdown">
          <h3>Your notifications</h3>
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`notificationItem ${notif.read ? "notificationRead" : "notificationUnread"}`}
              onClick={() => handleMarkAsRead(notif._id)}
            >
            {notif.text}
        </div>
      ))}
    </div>
  )}
</div>

      </div>
      <h2 style={{ fontSize: "2rem" }}>Overview</h2>
      <div className="userPosts">
        {userPosts.length > 0 ? 
          userPosts.map((post) => (
            <Post key={post._id} post={post} />
          )) : 
          <h1 style={{ color: "red", fontSize: "2rem" }}>No Posts yet</h1>
        }
      </div>
      <div className="settingsWrapper">
        <div className="settingsTitle">
          <span className="settingsUpdateTitle">Update Your Account</span>
          <span className="settingsDeleteTitle">Delete Account</span>
        </div>
        <form className="settingsForm" onSubmit={handleSubmit}>
          <label>Profile Picture</label>
          <div className="settingsPP">
            <img
              src={file ? URL.createObjectURL(file) : PF + user.profilePic}
              alt=""
            />
            <label htmlFor="fileInput">
              <i className="settingsPPIcon far fa-user-circle"></i>
            </label>
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <label>Username</label>
          <input
            type="text"
            placeholder={user.username}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label>Email</label>
          <input
            type="email"
            placeholder={user.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Password</label>
          <input
            type="password"
            placeholder="Leave blank if not changing"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="settingsSubmit" type="submit">
            Update
          </button>
          {success && (
            <span
              style={{ color: "green", textAlign: "center", marginTop: "20px" }}
            >
              Profile has been updated...
            </span>
          )}
        </form>
      </div>
    </div>
  );
}
