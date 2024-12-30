import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../index.css';

const Post = ({setIsRenderProfile, isRenderProfile}) => {
  const [isPost, setIsPost] = useState(false);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [privacy, setPrivacy] = useState('friends'); 
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const chooseImageBtn = useRef();
  const honestyChooseImageBtn = useRef();

  const handleGetModal = () => {
    setIsPost(true);
  };

  const handleCloseModal = () => {
    setIsPost(false);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Tạo URL tạm thời cho ảnh
      const newImageUrl = URL.createObjectURL(file); //Đây là một API của JavaScript tạo ra một URL tạm thời từ đối tượng File. URL này có thể được sử dụng để tham chiếu đến tệp đó trong ứng dụng web mà không cần tải lên server.
      setImage(newImageUrl);  // Cập nhật state với URL của ảnh, newImageUrl là một chuỗi
    }
  };

  const handlePrivacyChange = (e) => {
    const value = e.target.value;
    setPrivacy(value);
  };

  const handleFileClick = () => { // Trigger input file khi nhấn button
    honestyChooseImageBtn.current.click(); 
  };

  const fetchUserProfile = async () => { // lấy ra dữ liệu người dùng
    try {
      const userId = localStorage.getItem('userId');
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
      setIsRenderProfile(!isRenderProfile);
      honestyChooseImageBtn.current.value = '';
    } catch (error) {
      setIsLoading(false);
      console.error('Error creating post:', error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [])
  
  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!user) {
    return <div>Không tìm thấy thông tin người dùng.</div>;
  }

  return (
    <div className="my_post">
      {isPost && <div onClick={handleCloseModal} className="modalBackdrop"></div>}
      <div onClick={(e) => e.stopPropagation()} className={isPost ? 'modalPost' : 'modalPostHidden'}>
        {/* <form className="post_form" onSubmit={handleSubmit}> */}
          <textarea
            className="post_textarea"
            placeholder="What's on your mind?"
            value={content}
            onChange={handleContentChange}
          ></textarea>
          <div className="post_options">
            <label className="post_option">
              {/* <i className="fa-solid fa-images green"></i> */}
              <button ref={chooseImageBtn} onClick={handleFileClick} className='choose_image'><i className="fa-regular fa-image"></i></button>
              <input type="file" ref={honestyChooseImageBtn} accept="image/*" hidden onChange={handleImageChange} />
              {/* <span>Add Photo/Video</span> */}
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
        {/* </form> */}
      </div>
      <div className="post_top">
        {user.avatarUrl ? 
          <img src={`http://localhost:3001${user.avatarUrl}`} alt="Avatar"  />
          :
          <img  alt="Avatar"  src='https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg'/>
        }
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
    </div>
  );
};

export default Post;