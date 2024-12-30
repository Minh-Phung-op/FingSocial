
import React, { useEffect, useState } from 'react';
import './index.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FriendsPost from './posts/FriendsPost';
import RightSidebar from './components/RightSidebar';
import Post from './posts/Post';
import Story from './posts/Story';
import ProfileHeader from './profilefing/ProfileHeader';
import ProfileTabs from './profilefing/ProfileTabs';
import ProfileContent from './profilefing/ProfileContent';
import Register from './pages/Register';
import Login from './pages/Login';

// import LeftSide from './Friend/LeftSide';
import MainFriend from './Friend/MainFriend';
import MainRequest from './Friend/MainRequest';
import SearchFriend from './Friend/SearchFriend'; // Thêm SearchFriend

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRenderProfile, setIsRenderProfile] = useState(false);
  const [allUsers, setAllUsers] = useState([]); // Lưu danh sách người dùng

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(authStatus === 'true');
    setLoading(false);
  }, []);

  // useEffect(() => {
  //   // Fetch danh sách tất cả người dùng
  //   const fetchUsers = async () => {
  //     try {
  //       const response = await fetch('http://localhost:3001/users/all/');
  //       const data = await response.json();
  //       setAllUsers(data);
  //     } catch (error) {
  //       console.error('Không thể lấy danh sách người dùng:', error);
  //     }
  //   };
  //   fetchUsers();
  // }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated}/>}
        <div className="main">
          <Routes>
            {/* Trang chủ */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <>
                    <Sidebar />
                    <div className="center">
                      <Post setIsRenderProfile={setIsRenderProfile} isRenderProfile={isRenderProfile} />
                      <div className="top_box">
                        <Story />
                      </div>
                      <FriendsPost isRenderProfile={isRenderProfile} />
                    </div>
                    <RightSidebar />
                  </>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Trang cá nhân */}
            <Route
              path="/my-profile"
              element={
                isAuthenticated ? (
                  <div className="profile-page">
                    <ProfileHeader setIsRenderProfile={setIsRenderProfile} isRenderProfile={isRenderProfile} />
                    <ProfileTabs />
                    <ProfileContent isRenderProfile={isRenderProfile} />
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Trang Requests */}
            <Route
              path="/requests"
              element={
                isAuthenticated ? (
                  <div className="friend-page">
                    <Sidebar />
                    <div className="center">
                      <MainRequest />
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Trang Friends */}
            <Route
              path="/friends"
              element={
                isAuthenticated ? (
                  <div className="friend-page">
                    <Sidebar />
                    <div className="center">
                      <MainFriend/>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Trang Search */}
            {/* // Trang Search với LeftSide */}
              <Route
                path="/search"
                element={
                  isAuthenticated ? (
                    <div className="search-page">                    
                        <Sidebar />              
                      <div className="center">
                        <SearchFriend allUsers={allUsers} /> {/* Hiển thị trang tìm kiếm bạn bè */}
                      </div>
                    </div>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />


            {/* Trang đăng ký */}
            <Route path="/register" element={<Register />} />

            {/* Trang đăng nhập */}
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
