import React, { useEffect, useState } from 'react';
import '../friend.css';
import axios from 'axios';

const MainFriend = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reRender, setReRender] = useState(false)
  const [loadingRequest, setLoadingRequest] = useState(true)

  // Hàm lấy danh sách những người lạ
  const fetchFriends = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`http://localhost:3001/users/friends/${userId}`);
      setFriends(response.data);  // Cập nhật danh sách người lạ
      console.log(response); 
      setLoading(false);
    } catch (e) {
      console.log("Không lấy được người dùng", e);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [reRender]);

  // Hiển thị thông báo "Đang tải..." trong khi đang lấy dữ liệu
  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="main-friend">
      <h3>Bạn bè</h3>
      <div className="friend-requests">
        {friends.map((friend, index) => (
          <div className="card-vertical" key={index}>
            {friend.profile.avatarUrl ? 
              <img src={`http://localhost:3001${friend.profile.avatarUrl}`} alt="Avatar" />
              :
              <img alt="Avatar" src='https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg'/>
            }
            <div className="info">
              <h4>{friend.profile.fullName}</h4>
              {/* <button onClick={() => sendFriendRequest(user._id)}>Thêm bạn bè</button> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainFriend;