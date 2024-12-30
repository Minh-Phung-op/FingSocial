import React, { useEffect, useState } from "react";
import '../index.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigateToMyProfile = () => {
    // Chuyển đến trang /post
    navigate('/my-profile');
  };

  const navigateToRequests = () => {
    // Chuyển đến trang /request
    navigate('/requests');
  };

  const navigateToFriends = () => {
    // Chuyển đến trang /friends
    navigate('/friends');
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
    <div className="left">
      {/* Profile Section */}
      <div className="img" onClick={navigateToMyProfile}>
        {user.avatarUrl ? 
              <img src={`http://localhost:3001${user.avatarUrl}`} alt="Avatar" className="profile-avatar" />
              :
              <img  alt="Avatar" src='https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg'/>
            }
        <p>{user.fullName}</p>
      </div>

      {/* Friends Section */}
      <div className="img" onClick={navigateToFriends}>
        <img src="image/friend.png" alt="friend" />
        <p>Friends</p>
      </div>

      {/* Saved Section */}
      <div className="img">
        <img src="image/saved.png" alt="saved" />
        <p>Saved</p>
      </div>

      {/* Groups Section */}
      <div className="img" onClick={navigateToRequests}>
        <img src="image/group.png" alt="groups" />
        <p>Requests</p>
      </div>

      {/* Marketplace Section */}
      <div className="img">
        <img src="image/marketplace.png" alt="marketplace" />
        <p>Marketplace</p>
      </div>

      {/* Watch Section */}
      <div className="img">
        <img src="image/watch.png" alt="watch" />
        <p>Watch</p>
      </div>

      {/* See More Section */}
      <div className="img">
        <img src="image/down_arrow.png" alt="see more" />
        <p>See more</p>
      </div>
      <hr />

      {/* Shortcuts Section */}
      <h2>You shortcuts</h2>
      <p className="edit">Edit</p>

      {/* Shortcut items */}
      <div className="shortcuts">
        <img src="image/shortcuts_1.png" alt="shortcut" />
        <p>MOBILE GAMES</p>
      </div>
      <div className="shortcuts">
        <img src="image/shortcuts_2.jpeg" alt="shortcut" />
        <p>Online Education</p>
      </div>
      <div className="shortcuts">
        <img src="image/shortcuts_3.webp" alt="shortcut" />
        <p>Food Lovers</p>
      </div>
      <div className="shortcuts">
        <img src="image/shortcuts_4.png" alt="shortcut" />
        <p>Social Media Academy</p>
      </div>
      <div className="shortcuts">
        <img src="image/shortcuts_5.webp" alt="shortcut" />
        <p>PC Shop</p>
      </div>

      {/* See More in Shortcuts Section */}
      <div className="shortcuts">
        <img src="image/down_arrow.png" alt="see more" />
        <p>See more</p>
      </div>
    </div>
  );
};

export default Sidebar;
