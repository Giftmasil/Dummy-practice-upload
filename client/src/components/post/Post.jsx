import { useContext, useState } from "react";
import "./post.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { Context } from "../../context/Context";

export default function Post({ post }) {
  const PF = "http://localhost:5000/images/";
  const { user } = useContext(Context);
  const [likes, setLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(post.likes.includes(user._id));
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post.comments);
  const [displayComments, setDisplayComments] = useState(false);

  

  const handleLike = async () => {
    try {
      if (isLiked) {
        await axios.put(`/posts/${post._id}/unlike`, { userId: user._id });
        setLikes(likes.filter((id) => id !== user._id));
      } else {
        await axios.put(`/posts/${post._id}/like`, { userId: user._id });
  
        // Create like notification
        const newNotification = {
          type: "like",
          senderId: user._id,
          receiverId: post.userId,
          postId: post._id,
          text: `${user.username} liked your post.`, // Corrected notification text
        };
        await axios.post("/notifications", newNotification);
  
        setLikes([...likes, user._id]);
      }
      setIsLiked(!isLiked);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };
  
  const handleComment = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/posts/${post._id}/comment`, {
        userId: user._id,
        username: user.username,
        text: comment,
      });
      setComments(res.data); // Update comments state with new comments
  
      // Create comment notification
      const newNotification = {
        type: "comment",
        senderId: user._id,
        receiverId: post.userId,
        postId: post._id,
        text: `${user.username} commented on your post.`, // Corrected notification text
      };
      await axios.post("/notifications", newNotification);
      
      setComment(""); // Clear comment input after submission
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };
  
  const toggleComments = () => {
    setDisplayComments(!displayComments);
  };

  return (
    <div className="post">
      <Link to={`/post/${post._id}`} className="link">
        <span className="postTitle">{post.title}</span>
      </Link>
      {post.photo && <img className="postImg" src={PF + post.photo} alt="posts" />}

      <div className="postInfo">
        <div className="tinyThings">
        <div>
          <div className="postCats">
          {post.categories.map((c) => (
            <span className="postCat" key={c}>
              {c}
            </span>
          ))}
          </div>
          <span className="postDate">{new Date(post.createdAt).toDateString()}</span>
        </div>
        <div className="postLikes">
          <i
            className={isLiked ? "fa-solid fa-heart liked" : "fa-regular fa-heart unliked"}
            onClick={handleLike}
          ></i>
          <span className="likeCounter">{likes.length}</span>
          <i className="fa-regular fa-comment" onClick={toggleComments}></i>
        </div>
        </div>
      </div>
      <p className="postDesc">{post.desc}</p>

      {displayComments && (
        <div className="commentsSection">
          <hr />
          <form className="commentForm" onSubmit={handleComment}>
            <textarea
              className="commentInput"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
            <button type="submit" className="commentButton">
              Comment
            </button>
          </form>

          <div className="comments">
            {comments.map((comment) => (
              <div key={comment._id} className="comment">
                <b>{comment.username}</b>: {comment.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
