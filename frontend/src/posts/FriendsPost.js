import React, { useState, useEffect, useRef } from "react";
import '../index.css';
import commentStyle from "./comment.module.css"
import axios from "axios";

const FriendsPost = (isRenderProfile) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const userId = localStorage.getItem('userId');
  const [newComment, setNewComment] = useState(""); // State for new comment input
  const commentRefs = useRef({});
  const [comments, setComments] = useState({}); // Lưu bình luận cho từng bài viết
  const [isCommentModal, setIsCommentModal] = useState(false);
  const [activePostIdForComments, setActivePostIdForComments] = useState(null);
  const [commentsData, setCommentsData] = useState([]);
  const [idPostC, setidPostC] = useState(null);
  const commentFormRef = useRef(null);  // Tạo ref cho form comment
  const [hoveredCommentId, setHoveredCommentId] = useState(null);
  const [reRender, setReRender] = useState(false);

  // Hàm xử lý click bên ngoài form comment để đóng modal
  const handleModalClick = (event) => {
    // Kiểm tra nếu click không phải bên trong form comment
    if (commentFormRef.current && !commentFormRef.current.contains(event.target)) {
      setIsCommentModal(false); // Đóng modal
      document.body.style.overflow="auto";
    }
  };

  const handleMouseEnter = (commentId, commentUserId, postCurrentId) => {
    if (commentUserId === userId || postCurrentId === userId) {
      setHoveredCommentId(commentId); // Hiển thị menu hành động khi di chuột vào
    }
  };

  const handleMouseLeave = () => {
    setHoveredCommentId(null);
  };
  const handleEditComment = async (commentId) => {
    // Prompt để người dùng nhập nội dung mới cho bình luận
    const newContent = prompt("Edit your comment:");

    // Nếu người dùng nhập nội dung mới
    if (newContent) {
      try {
        // Gửi PUT request để cập nhật bình luận trên server
        const response = await axios.put(
          `http://localhost:3001/api/posts/${idPostC}/comments/${commentId}`,
          {
            userId,       // userId của người đang thực hiện thao tác
            content: newContent, // Nội dung mới của bình luận
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true, // Nếu cần truyền thông tin đăng nhập
          }
        );

        // Cập nhật lại dữ liệu bình luận trong state sau khi sửa thành công
        setCommentsData((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId ? { ...comment, content: newContent } : comment
          )
        );

        console.log("Comment updated successfully", response.data);
      } catch (error) {
        console.error("Error editing comment:", error);
        alert("Error editing comment!");
      }
    }
  };


  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        // Thay vì truyền data trong body, hãy sử dụng params
        await axios.delete(`http://localhost:3001/api/posts/${idPostC}/comments/${commentId}`, {
          data: { userId },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,// Truyền userId qua query params
        });
        // Cập nhật lại list comments sau khi xóa
        setCommentsData(prevComments => prevComments.filter(comment => comment._id !== commentId));
      } catch (error) {
        console.error("Error deleting comment:", error);
        alert("Error deleting comment!");
      }
    }
  };

  const handleKeyPress = (e, postId) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Ngăn không cho enter tạo dòng mới
      handleCommentSubmit(e, postId); // Gọi hàm gửi bình luận
    }
  };

  const timeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date); // Sự chênh lệch tính bằng milliseconds

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      return `${years} năm trước`;
    } else if (months > 0) {
      return `${months} tháng trước`;
    } else if (days > 0) {
      return `${days} ngày trước`;
    } else if (hours > 0) {
      return `${hours} giờ trước`;
    } else if (minutes > 0) {
      return `${minutes} phút trước`;
    } else {
      return `${seconds} giây trước`;
    }
  };


  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();

    const userId = localStorage.getItem('userId');
    const commentContent = commentRefs.current[postId]?.value; // Lấy nội dung bình luận từ ref 

    if (!commentContent) {
      alert('Please write a comment!');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3001/api/posts/${postId}/comment`,
        { userId, content: commentContent },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );

      // Cập nhật lại bình luận cho bài viết
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: [...(prevComments[postId] || []), response.data] // Thêm bình luận mới vào bài viết
      }));
      setReRender(!reRender)
      // Clear input after submission
      commentRefs.current[postId].value = '';
      
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment!');
    }
  };

  const handleCommentClick = (postId) => {
    setActivePostIdForComments(postId);  // Lưu ID bài viết cần hiển thị bình luận
    fetchComments(postId);  // Gọi API để lấy bình luận
    setIsCommentModal(true);  // Mở modal bình luận
    document.body.style.overflow = "hidden";
  };


  const fetchComments = async (postId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/posts/${postId}/comments`);
      setCommentsData(response.data); // Lưu bình luận vào state
    } catch (error) {
      console.log("Error fetching comments:", error);
      alert("Error fetching comments.");
    }
  };

  const fetchPosts = async () => {
    try {
      // const response = await axios.get('http://localhost:3001/api/posts', {
      const response = await axios.get(`http://localhost:3001/api/posts/filterPosts/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      setPosts(response.data);
      console.log(response);
      
    } catch (error) {
      console.log('Error fetching posts:', error);
    }
  };

  const handleLike = async (postId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.log("User is not logged in");
      return
    }

    try {
      const response = await axios.put(`http://localhost:3001/api/posts/like/${postId}`,
        { userId },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Cập nhật lại danh sách posts sau khi thả/gỡ like
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: response.data.likes } : post
        )
      );
      setReRender(!reRender)
    } catch (error) {
      console.log('Error liking post:', error);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, [isRenderProfile, reRender]);

  return (
    <div>
      {posts.map(post => (
        <div className="friends_post" key={post._id}>
          <div className="friend_post_top">
            <div className="img_and_name">
            {post.userId?.profile?.avatarUrl? 
              <img src={`http://localhost:3001${post.userId?.profile?.avatarUrl}`}alt="profile"/>
              :
              <img  alt="Avatar"  src='https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg'/>
            }
              <div className="friends_name">
                <p>{post.userId?.profile?.fullName || "Unknown User"}</p>
                <p className="time">
                  {new Date(post.createdAt).toLocaleString()}
                  <i className="fa-solid fa-user-group"></i>
                </p>
              </div>
            </div>
          </div>

          <div className="contentPost">
            <p dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
            {post.imageUrl && (
              <img src={`http://localhost:3001${post.imageUrl}`} alt="post content" />
            )}
          </div>

          <div className="info">
            <div className="emoji_img">
              <p>{post.likes.length} likes</p>
            </div>
            <div className="comment">
              <p>{post.comments.length} Comments</p>
            </div>
          </div>
          <hr style={{ marginBottom: "7px" }} />
          {/* Like, Comment, Share icons */}
          <div className="like">
            <div className="like_icon" onClick={() => handleLike(post._id)}>
            <i className={`fa-solid fa-thumbs-up ${post.likes.some((like) => {return like._id == userId}) ? 'activi' : ''}`}></i> 
            <p className={post.likes.some((like) => {return like._id == userId}) ? 'activi' : ''}>Like</p>
            </div>
            <div className="like_icon" onClick={() => { handleCommentClick(post._id); setidPostC(post._id); }}>
              <i className="fa-solid fa-message"></i>
              <p>Comments</p>
            </div>

            <div className="like_icon">
              <i className="fa-solid fa-share"></i>
              <p>Share</p>
            </div>
            {/* modal comment */}
            {isCommentModal && activePostIdForComments && (
              <div onClick={handleModalClick} className={commentStyle.hiddenTogleModal}>
                <div ref={commentFormRef} className={commentStyle.commentModalContainer}>
                  <h3> Comments của bài viết </h3>
                  <div style={{}} className={commentStyle.commentModalComponents}>
                    {commentsData.length > 0 ? (
                      commentsData.map((comment, index) => (
                        <div key={comment._id} className={commentStyle.commentElement}
                          onMouseEnter={() => handleMouseEnter(comment._id, comment.userId._id, post.userId._id)} onMouseLeave={handleMouseLeave} // Khi di chuột ra khỏi bình luận
                          style={{}}
                        >
                          <div className={commentStyle.mainCommentContent}>
                            <div className={commentStyle.commentContent}>
                            {/* {comment.userId?.profile?.avatarUrl? 
              <img  src={`http://localhost:3001${comment.userId?.profile?.avatarUrl}`}alt="profile"/>
              :
              <img alt="Avatar"  src='https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg'/>
            } */}
                              <p>  {comment.userId?.profile?.avatarUrl? 
              <img className={commentStyle.imgAvatarComment} src={`http://localhost:3001${comment.userId?.profile?.avatarUrl}`}alt="profile"/>
              :
              <img className={commentStyle.imgAvatarComment} alt="Avatar"  src='https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg'/>
            }<strong>{comment.userId?.profile?.fullName || "Anonymous"}</strong></p>
                            </div>
                            <div className={commentStyle.commentTextContent}>
                              <p>{comment.content}</p>
                              <p className={commentStyle.commentTimeAgo}>{timeAgo(comment.createdAt)}</p>
                            </div>
                          </div>
                          {/* Chỉ hiển thị menu sửa/xóa khi người dùng là chủ bình luận hoặc chủ bài viết */}
                          {hoveredCommentId === comment._id && comment.userId._id === userId && (
                            <div className={commentStyle.commentAction}>
                              <button
                                onClick={() => handleEditComment(comment._id)}
                                className={commentStyle.commentEditBtn}
                              >
                                <i className="fa-solid fa-pen-to-square"></i>
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className={commentStyle.commentDeleteBtn}
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button> 
                            </div>
                          )}

                        </div>
                      ))
                    ) : (
                      <p>No comments yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <hr style={{ marginTop: "7px" }} />
          <div className="comment_warpper">
            {post.userId?.profile?.avatarUrl? 
              <img src={`http://localhost:3001${post.userId?.profile?.avatarUrl}`}alt="profile" />
              :
              <img  alt="Avatar"  src='https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg'/>
            }
            <div className="comment_search">
              <input
                ref={(el) => (commentRefs.current[post._id] = el)} // Đặt ref cho input comment của bài viết
                type="text"
                placeholder="Write a comment"
                onKeyDown={(e) => handleKeyPress(e, post._id)} // Lắng nghe sự kiện nhấn Enter
              />
              <i className="fa-regular fa-face-smile"></i>
              <i className="fa-solid fa-camera"></i>
              <i className="fa-regular fa-note-sticky"></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendsPost;