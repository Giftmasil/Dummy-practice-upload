import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";
import "./singlepost.css";

export default function SinglePost() {
  const location = useLocation();
  const path = location.pathname.split("/")[2];
  const [post, setPost] = useState({});
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [updateMode, setUpdateMode] = useState(false);
  const { user, dispatch } = useContext(Context);
  const [isFollowing, setIsFollowing] = useState(false);
  const PF = "http://localhost:5000/images/";

  useEffect(() => {
    const getPost = async () => {
      try {
        const res = await axios.get(`/posts/${path}`);
        setPost(res.data);
        setTitle(res.data.title);
        setDesc(res.data.desc);
      } catch (err) {
        console.error("Error fetching post:", err);
      }
    };
    getPost();
  }, [path]);

  useEffect(() => {
    if (post.userId) {
      setIsFollowing(user.following.includes(post.userId));
    }
  }, [post.userId, user.following]);

 // For updating a post
const handleUpdate = async () => {
  try {
    await axios.put(`/posts/${post._id}`, {
      userId: user._id, // Ensure this is correctly sent
      username: user.username,
      title,
      desc,
    });
    setUpdateMode(false);
  } catch (err) {
    console.error("Error updating post:", err);
  }
};

// For deleting a post
const handleDelete = async () => {
  const confirm = window.confirm("Are you sure you want to delete this post?");
  if (confirm) {
    try {
      await axios.delete(`/posts/${post._id}`, {
        data: { userId: user._id }, // Ensure this is correctly sent
      });
      window.location.replace("/");
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  }
};

  const handleFollow = async () => {
    try {
      await axios.post(`/users/${post.userId}/follow`, { userId: user._id });
      dispatch({ type: "UPDATE_SUCCESS", payload: {
        ...user,
        following: [...user.following, post.userId]
      }});
      setIsFollowing(true);
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.put(`/users/${post.userId}/unfollow`, { userId: user._id });
      dispatch({ type: "UPDATE_SUCCESS", payload: {
        ...user,
        following: user.following.filter(id => id !== post.userId)
      }});
      setIsFollowing(false);
    } catch (err) {
      console.error("Error unfollowing user:", err);
    }
  };

  return (
    <div className="singlePost">
      <div className="singlePostWrapper">
        {post.photo && (
          <img src={PF + post.photo} alt="" className="singlePostImg" />
        )}
        {updateMode ? (
          <input
            type="text"
            value={title}
            className="singlePostTitleInput"
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <h1 className="singlePostTitle">
            {title}
            <div className="followButton">
              {isFollowing ? (
                <button className="unfollowButton" onClick={handleUnfollow}>
                  Unfollow
                </button>
              ) : (
                <button className="follow" onClick={handleFollow}>
                  Follow
                </button>
              )}
            </div>
            {post.username === user.username && (
              <div className="singlePostEdit">
                <i
                  className="singlePostIcon far fa-edit"
                  onClick={() => setUpdateMode(true)}
                ></i>
                <i
                  className="singlePostIcon far fa-trash-alt"
                  onClick={handleDelete}
                ></i>
              </div>
            )}
          </h1>
        )}
        <div className="singlePostInfo">
          <span className="singlePostAuthor">
            Author:
            <Link to={`/?user=${post.username}`} className="link">
              <b> {post.username}</b>
            </Link>
          </span>
          <span className="singlePostDate">
            {new Date(post.createdAt).toDateString()}
          </span>
        </div>
        {updateMode ? (
          <textarea
            className="singlePostDescInput"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        ) : (
          <p className="singlePostDesc">{desc}</p>
        )}
        {updateMode && (
          <div className="updateDiv">
            <button className="singlePostButton" onClick={handleUpdate}>
              Update
            </button>
            <button
              className="singlePostCancelButton"
              onClick={() => setUpdateMode(false)}
            >
              Cancel Update
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
