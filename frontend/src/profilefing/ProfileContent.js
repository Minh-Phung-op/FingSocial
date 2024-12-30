import React, { useEffect, useState, useRef } from 'react';
import '../profile.css';
import axios from 'axios';
import commentStyle from "../posts/comment.module.css"

const ProfileContent = ({ isRenderProfile }) => {
  const [isPost, setIsPost] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const [activePostId, setActivePostId] = useState(null);
  const [reRender, setReRender] = useState(false);
  const [privacy, setPrivacy] = useState('friends');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const chooseImageBtn = useRef();
  const honestyChooseImageBtn = useRef();
  const editContentPost = useRef();
  const commentRefs = useRef({});
  const [comments, setComments] = useState({}); // Lưu bình luận cho từng bài viết
  const [isCommentModal, setIsCommentModal] = useState(false);
  const [activePostIdForComments, setActivePostIdForComments] = useState(null);
  const [commentsData, setCommentsData] = useState([]);
  const [idPostC, setidPostC] = useState(null);
  const commentFormRef = useRef(null);  // Tạo ref cho form comment
  const [hoveredCommentId, setHoveredCommentId] = useState(null);

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


  const handleGetModal = () => {
    setIsPost(true);
  };

  const handleGetModalEdit = (post) => {
    const currentUserId = localStorage.getItem("userId");
    setIsEdit(true);
    setContent(post.content);
    setPrivacy(post.status);
    setActivePostId(post._id);
    setImage(post.imageUrl ? `http://localhost:3001${post.imageUrl}` : null);
  };

  const handleCloseModal = () => {
    setIsPost(false);
  };

  const handleCloseModalEdit = () => {
    setIsEdit(false);
    setContent('');
    setPrivacy('friends');
    setImage(null);
  };


  const handleToggleMenu = (postId) => {
    setActivePostId(activePostId === postId ? null : postId);
  };
  const handlePrivacyChange = (e) => {
    const value = e.target.value;
    setPrivacy(value);
  };

  const handleContentChangeCreate = (e) => {
    setContent(e.target.value);
  };

  const handleFileClick = () => { // Trigger input file khi nhấn button
    honestyChooseImageBtn.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Tạo URL tạm thời cho ảnh
      const newImageUrl = URL.createObjectURL(file); //Đây là một API của JavaScript tạo ra một URL tạm thời từ đối tượng File. URL này có thể được sử dụng để tham chiếu đến tệp đó trong ứng dụng web mà không cần tải lên server.
      setImage(newImageUrl);  // Cập nhật state với URL của ảnh, newImageUrl là một chuỗi
    }
  };

  const fetchUserProfile = async () => { // lấy ra dữ liệu người dùng
    try {
      if (!userId) {
        window.location.href = '/login';
        return;
      }
      const response = await axios.get(`http://localhost:3001/users/profile/${userId}`)
      setUser(response.data.user);
      setLoading(false);
    } catch (e) {
      console.error("Không lấy được người dùng", e);
      setLoading(false);
    };
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/posts/user/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      // In dữ liệu trả về để kiểm tra
      console.log(response);
      setPosts(response.data);

      // getPost
    } catch (error) {
      console.log('Error fetching posts:', error);
    }

  };

  const handleLike = async (postId) => {
    if (!userId) {
      console.log("User is not logged in");
      return
    }
    try {
      const response = await axios.put(`http://localhost:3001/api/posts/like/${postId}`, { userId },
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

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:3001/api/posts/${postId}`, {
        data: { userId },
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      // Cập nhật danh sách bài viết sau khi xóa
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Bạn không có quyền xóa bài viết này.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const file = honestyChooseImageBtn.current.files[0]
      const postData = new FormData();
      postData.append('userId', userId);
      postData.append('content', content);
      postData.append('status', privacy);
      if (image) {
        postData.append('imageUrl', file); // Gửi file ảnh
      }

      await axios.post(`http://localhost:3001/api/posts/${userId}`, postData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setContent('');
      setImage(null);
      setPrivacy('friends'); // Hoặc giá trị mặc định của trạng thái privacy
      setIsPost(false);
      setIsLoading(false);
      setReRender(!reRender);
      honestyChooseImageBtn.current.value = '';
    } catch (error) {
      setIsLoading(false);
      console.error('Error creating post:', error);
    }
  };

  const handleSubmitEditPost = async (e) => {
    e.preventDefault();

    if (!activePostId) {
      alert("Bài viết không tồn tại.");
      return;
    }

    try {
      setIsLoading(true);
      const userId = localStorage.getItem("userId");
      const file = honestyChooseImageBtn.current.files[0]
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("content", content);
      formData.append("status", privacy);

      if (image) {
        formData.append("imageUrl", file); // Gửi file ảnh
      }

      const response = await axios.put(
        `http://localhost:3001/api/posts/${userId}/${activePostId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      // Cập nhật bài viết trong danh sách
      setPosts(posts.map((post) => (post._id === activePostId ? response.data : post)));

      setIsEdit(false);
      setContent('');
      setPrivacy('friends');
      setImage(null);
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Không thể cập nhật bài viết.");
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý click bên ngoài form comment để đóng modal
  const handleModalClick = (event) => {
    // Kiểm tra nếu click không phải bên trong form comment
    if (commentFormRef.current && !commentFormRef.current.contains(event.target)) {
      setIsCommentModal(false); // Đóng modal
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
  // userEffect để lấy ra profile data và posts
  useEffect(() => {
    fetchUserProfile();
    fetchPosts();
  }, [isRenderProfile, reRender])

  if (!user) {
    return <div>Loading ...</div>
  }

  return (
    <div className="profile-content">
      <div className="profile-left">
        <div className="about">
          <h3>Giới thiệu</h3>
          {user.dob ? <p><i className="fa-solid fa-cake-candles" style={{ margin: "0 10px 0 2px " }}></i>{user.dob}</p> : ""}
          {user.location ? <p><i className="fa-solid fa-location-dot" style={{ margin: "0 10px 0 2px " }}></i>{user.location}</p> : ""}
          {user.bio ? <p><i className="fa-solid fa-book" style={{ margin: "0 10px 0 2px " }}></i> {user.bio}</p> : ""}
        </div>
      </div>

      <div className="my_post">
        {isPost && <div onClick={handleCloseModal} className="modalBackdrop"></div>}
        <div onClick={(e) => e.stopPropagation()} className={isPost ? 'modalPost' : 'modalPostHidden'} >
          <textarea
            className="post_textarea"
            placeholder="What's on your mind?"
            value={content}
            onChange={handleContentChangeCreate}
          ></textarea>
          <div className="post_options">
            <label className="post_option">
              <button ref={chooseImageBtn} onClick={handleFileClick} className='choose_image'><i className="fa-regular fa-image"></i></button>
              <input type="file" ref={honestyChooseImageBtn} accept="image/*" hidden onChange={handleImageChange} />
            </label>
            <label className="post_option">
              <select value={privacy} onChange={handlePrivacyChange}>
                <option value="friends">Bạn bè</option>
                <option value="everyone">Mọi người</option>
              </select>
            </label>
          </div>
          <div className="post_image">
            {image &&
              <img src={image} className='image_toPost' alt="post content" />
            }
          </div>
          <button type="submit" className="post_submit" disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>

        {isEdit && (
          <div onClick={handleCloseModalEdit} className="modalBackdrop"></div>
        )}
        <div onClick={(e) => e.stopPropagation()} className={isEdit ? 'modalPost' : 'modalPostHidden'}>
          <textarea
            className="post_textarea"
            placeholder="What's on your mind?"
            value={content} // Hiển thị nội dung của bài viết cũ khi mở form
            onChange={() => setContent(editContentPost.current.value)} // Cập nhật nội dung khi người dùng chỉnh sửa
            ref={editContentPost}
          ></textarea>
          <div className="post_options">
            <label className="post_option">
              <button ref={chooseImageBtn} onClick={handleFileClick} className='choose_image'><i className="fa-regular fa-image"></i></button>
              <input type="file" ref={honestyChooseImageBtn} accept="image/*" hidden onChange={handleImageChange} />
            </label>
            <label className="post_option">
              <select
                value={privacy} // Hiển thị quyền riêng tư của bài viết cũ
                onChange={(e) => setPrivacy(e.target.value)}>
                <option value="friends">Bạn bè</option>
                <option value="everyone">Mọi người</option>
              </select>
            </label>
          </div>
          <div className="post_image">
            {image &&
              <img src={image} className='image_toPost' alt="post content" />
            }
          </div>
          <button type="submit" className="post_submit" disabled={isLoading} onClick={handleSubmitEditPost}>
            {isLoading ? 'Updating...' : 'Update'}
          </button>
        </div>

        <div className="post_top">
          {user.avatarUrl ?
            <img src={`http://localhost:3001${user.avatarUrl}`} alt="Avatar" />
            :
            <img src="https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg" alt="Avatar" />}
          <input onClick={handleGetModal} type="button" value="What's on your mind?" /> 
        </div>
        <hr />
        <div className="post_bottom">
          <div className="post_icon">
            <i className="fa-solid fa-video red"></i>
            <p>Live video</p>
          </div>

          <div className="post_icon">
            <i className="fa-solid fa-images green"></i>
            <p>Photo/video</p>
          </div>

          <div className="post_icon">
            <i className="fa-regular fa-face-grin yellow"></i>
            <p>Feeling/activity</p>
          </div>
        </div>
        {posts.map(post => (
          <div className="friends_post" key={post._id}>
            <div className="friend_post_top">
              <div className="img_and_name">
              {post.userId?.profile?.avatarUrl? 
                <img src={`http://localhost:3001${post.userId?.profile?.avatarUrl}`}  alt="profile"/>
                :
                <img  alt="Avatar"  src='https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg'/>
              }
                <div className="friends_name">
                  <p className='user_name'>{post.userId?.profile?.fullName || "Unknown User"}</p>
                  <p className="time">
                    {new Date(post.createdAt).toLocaleString()}
                    <i className="fa-solid fa-user-group"></i>
                  </p>
                </div>
              </div>

              <div className="menu">
                <i
                  className="fa-solid fa-ellipsis"
                  onClick={() => handleToggleMenu(post._id)}
                ></i>
                {activePostId === post._id && (
                  <div className="actionPost">
                    <button className='editPostBtn' onClick={() => handleGetModalEdit(post)}><i className="fa-solid fa-pen"></i></button>
                    <button className='deletePostBtn' onClick={() => handleDeletePost(post._id)}><i className="fa-solid fa-trash"></i></button>
                  </div>
                )}
              </div>
            </div>

            <div className="contentPost">
              <p dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
              {post.imageUrl && (
                <img src={`http://localhost:3001${post.imageUrl}`} alt="post content" style={{ maxWidth: '100%' }} />
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
                <i className={`fa-solid fa-thumbs-up ${post.likes.some((like) => { return like._id == userId }) ? 'activi' : ''}`}></i>
                <p className={post.likes.some((like) => { return like._id == userId }) ? 'activi' : ''}>Like</p>
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
                    <h3> Comment của bài viết</h3>
                    <div style={{}} className={commentStyle.commentModalComponents}>
                      {commentsData.length > 0 ? (
                        commentsData.map((comment, index) => (
                          <div key={comment._id} className={commentStyle.commentElement}
                            onMouseEnter={() => handleMouseEnter(comment._id, comment.userId._id, post.userId._id)} onMouseLeave={handleMouseLeave} // Khi di chuột ra khỏi bình luận
                            style={{}}
                          >
                            <div className={commentStyle.mainCommentContent}>
                              <div className={commentStyle.commentContent}>
                                <p><strong>{comment.userId?.profile?.fullName || "Anonymous"}</strong></p>
                              </div>
                              <div className={commentStyle.commentTextContent}>
                                <p>{comment.content}</p>
                                <p className={commentStyle.commentTimeAgo}>{timeAgo(comment.createdAt)}</p>
                              </div>
                            </div>
                            <div className={commentStyle.commentAction}>
                              {
                                // Kiểm tra xem người dùng có phải là chủ bình luận không
                                hoveredCommentId === comment._id && comment.userId._id === userId ? (
                                  <>
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
                                  </>
                                ) : (
                                  // Nếu không, kiểm tra xem người dùng có phải là chủ bài viết không
                                  post.userId?._id === userId && (
                                    <button
                                      onClick={() => handleDeleteComment(comment._id)}
                                      className={commentStyle.commentDeleteBtn}
                                    >
                                      <i className="fa-solid fa-trash"></i>
                                    </button>
                                  )
                                )
                              }
                            </div>
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

    </div>
  );
};

export default ProfileContent;
