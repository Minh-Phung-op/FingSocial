import React, { useEffect, useState } from "react";
import '../index.css';
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";


const Navbar = ({setIsAuthenticated}) => {
  const [searchInput, setSearchInput] = useState('');
  // const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate()
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const handleSearch = (event) => {
    if (event.key === 'Enter' && searchInput.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
    }
  };
  const navigateToIndex = () => {
    navigate("/")
  }

  // const navigateToFriends = () => {
  //   navigate("/friends")
  // }

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

  const handleLogout = () => {
    // Xóa thông tin người dùng và trạng thái xác thực
    localStorage.removeItem('userId');
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    // Điều hướng về trang đăng nhập
    navigate('/login');
    setIsDropdownVisible(false);
  }

  // Toggle dropdown khi click vào ảnh
  const handleAvatarClick = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };
  return (
    <nav>
        <div className="left">
        <div className="logo">
          <img src="/image/mediumFing.png" alt="MediumFing" onClick={navigateToIndex} />
        </div>
        <div className="search_bar">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder={
              location.pathname === '/friend'
                ? 'Search friends...'
                : location.pathname === '/profile'
                ? 'Search profiles...'
                : 'Search on Fing...'
            }
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      <div className="center">
        <i className="fa-solid fa-house"></i>
        <i className="fa-solid fa-tv"></i>
        <i className="fa-solid fa-store"></i>
        <i className="fa-solid fa-users"></i>
      </div>

      <div className="right">
        <i className="fa-solid fa-list-ul"></i>
        <i className="fa-brands fa-facebook-messenger"></i>
        <i className="fa-solid fa-bell"></i>
        <i className="fa-solid fa-moon"></i>
        <i className="fa-solid fa-sign-out-alt"></i>
        {user.avatarUrl ?
          <img src={`http://localhost:3001${user.avatarUrl}`} alt="Avatar" onClick={handleAvatarClick}/>
          :
          <img alt="Avatar" src='https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg' onClick={handleAvatarClick}/>
        }
        {isDropdownVisible && (
        <div className="dropdown-menu">
          <p onClick={handleLogout}>Log out</p>
        </div>
      )}
      </div>
    </nav>
  );
};

export default Navbar;





// import React, { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import '../friend.css';

// const Navbar = () => {
//   const [searchInput, setSearchInput] = useState('');
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleSearch = (event) => {
//     if (event.key === 'Enter' && searchInput.trim()) {
//       navigate(`/search?query=${encodeURIComponent(searchInput.trim())}`);
//       setSearchInput('');
//     }
//   };

//   return (
//     <nav>
//       <div className="left">
//         <div className="logo">
//           <img src="/image/mediumFing.png" alt="MediumFing" />
//         </div>
//         <div className="search_bar">
//           <i className="fa-solid fa-magnifying-glass"></i>
//           <input
//             type="text"
//             placeholder={
//               location.pathname === '/friend'
//                 ? 'Search friends...'
//                 : location.pathname === '/profile'
//                 ? 'Search profiles...'
//                 : 'Search on Fing...'
//             }
//             value={searchInput}
//             onChange={(e) => setSearchInput(e.target.value)}
//             onKeyDown={handleSearch}
//           />
//         </div>
//       </div>
//       <div className="center">
//         <i className="fa-solid fa-house"></i>
//         <i className="fa-solid fa-tv"></i>
//         <i className="fa-solid fa-store"></i>
//         <i className="fa-solid fa-users"></i>
//       </div>
//       <div className="right">
//         <i className="fa-solid fa-list-ul"></i>
//         <i className="fa-brands fa-facebook-messenger"></i>
//         <i className="fa-solid fa-bell"></i>
//         <i className="fa-solid fa-moon"></i>
//         <img src="image/profile.png" alt="Profile" />
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
