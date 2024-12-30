

import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import axios
import { useLocation } from 'react-router-dom'; // Lấy query string từ URL
import '../friend.css';

const SearchFriend = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // State để lưu danh sách người dùng
  const location = useLocation();

  useEffect(() => {
    // Gửi yêu cầu HTTP để lấy danh sách người dùng từ API
    axios.get('http://localhost:3001/users/all') // Địa chỉ API bạn cần gọi
      .then((response) => {
        setAllUsers(response.data); // Lưu dữ liệu người dùng vào state
      })
      .catch((error) => {
        console.error('Có lỗi khi lấy dữ liệu người dùng:', error);
      });
  }, []); // Chỉ chạy khi component được mount

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('query'); // Lấy từ khóa từ URL
    if (query && allUsers.length) {
      const results = allUsers.filter((user) =>
        user.profile.fullName.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    }
  }, [location.search, allUsers]); // Chạy lại khi URL hoặc danh sách người dùng thay đổi

  return (
    <div className="content-friend">
      {/* Mọi người */}
      <div className="people-section">
        <h3>Mọi người</h3>
        {searchResults.length > 0 ? (
          searchResults.map((user, index) => (
            <div className="person" key={index}>
             
                <img className="avatar"
                  src={
                    user.profile.avatarUrl
                      ? `http://localhost:3001${user.profile.avatarUrl}`
                      : 'https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg'
                  }
                  alt="Avatar"
                />
           
              <div className="info">
                <p className="name">{user.profile.fullName}</p>
                <p className="details">{user.profile.school} · Sống tại {user.profile.location}</p>
              </div>
              <button className="add-friend">Thêm bạn bè</button>
            </div>
          ))
        ) : (
          <p>Không tìm thấy kết quả phù hợp.</p>
        )}
        <div className="see-more">
          <button>Xem tất cả</button>
        </div>
      </div>

      {/* Bài viết */}
      <div className="post-section">
        <div className="post">
          <p className="user">
            Đoán Xem <span>10 tháng 12 lúc 12:27</span>
          </p>
          <p className="emoji">😕</p>
          <div className="media">
            <p>GenZ Nghe Gì? - Theo dõi</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFriend;

