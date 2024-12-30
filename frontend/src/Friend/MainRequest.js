import React, { useEffect, useState } from 'react';
import '../friend.css';
import axios from 'axios';

const MainRequest = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reRender, setReRender] = useState(false)
  const [friendRequests, setFriendRequests] = useState([])
  const [loadingRequest, setLoadingRequest] = useState(true)

  // Hàm lấy danh sách những người lạ
  const fetchSuggestedUsers = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`http://localhost:3001/users/suggested-friends/${userId}`);
      setUsers(response.data);  // Cập nhật danh sách người lạ
      // console.log(response); 
      setLoading(false);
    } catch (e) {
      console.log("Không lấy được người dùng", e);
    }
  };

  const fetchSendingFriendRequest = async (req, res) => {
    try{
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`http://localhost:3001/users/friends-request/${userId}`);
      setFriendRequests(response.data);
      console.log(response);
      
      setLoadingRequest(false);
      console.log(friendRequests);
    } catch(e){
      console.log("Không tìm thấy người dùng: ", e);
    }
  }

  const sendFriendRequest = async (receiverId) => {
    try{
      const userId = localStorage.getItem('userId');
      const response = await axios.post('http://localhost:3001/users/send-friend-request', {
        senderId: userId,
        receiverId: receiverId
      });
      setUsers(response.data.suggestedUsers);  // Sử dụng danh sách người lạ mới từ backend
      // console.log(response.data);
      setReRender(!reRender);
    } catch(e){
      console.log('Error sending friend request', e);
    }
  }

  const acceptFriendRequest = async (friendId) => {
    try {
        const userId = localStorage.getItem('userId');
        const response = await axios.post('http://localhost:3001/users/accept-friend-request', {
          userId,
          friendId,
        });
        // console.log(response.data);
        setReRender(!reRender)
    } catch (error) {
        console.error('Error accepting friend request', error);
    }
};

  useEffect(() => {
    fetchSuggestedUsers();  // Lấy danh sách những người lạ khi component mount
    fetchSendingFriendRequest(); // Lấy danh sách lời mời kết bạn
  }, [reRender]);

  // Hiển thị thông báo "Đang tải..." trong khi đang lấy dữ liệu
  if (loading) {
    return <div>Đang tải...</div>;
  }

  if(loadingRequest){
    return <div>Đang tải...</div>;
  }

  return (
    <div className="main-friend">
        <h3>Lời mời kết bạn</h3>
        {friendRequests.length === 0 ? 
        <>
          <p>Chưa có thêm lời mời kết bạn nào</p>
          <br/>
        </>
        :
        <div className="friend-requests">
          {friendRequests.map((request, index) => (
            <div className="card-vertical" key={index}>
              {request.profile?.avatarUrl ? 
              <img src={`http://localhost:3001${request.profile.avatarUrl}`} alt='avatar'/>
              :
              <img src="https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg" alt="avatar" />
            }
              <div className="info">
                <h4>{request.profile?.fullName}</h4>
                <button className="confirm" onClick={() => acceptFriendRequest(request._id)}>Xác nhận</button>
                {/* <button className="delete">Xóa</button> */}
              </div>
            </div>
          ))}
        </div>
        }
      <hr />
      <h3>Những người bạn có thể biết</h3>
      <div className="suggested-friends">
        {users.map((user, index) => (
          <div className="card-vertical" key={index}>
            {user.profile.avatarUrl ? 
              <img src={`http://localhost:3001${user.profile.avatarUrl}`} alt="Avatar" />
              :
              <img alt="Avatar" src='https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg'/>
            }
            <div className="info">
              <h4>{user.profile.fullName}</h4>
              <button onClick={() => sendFriendRequest(user._id)}>Thêm bạn bè</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainRequest;