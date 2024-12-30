import React from 'react';
import '../index.css';

const RightSidebar = () => {
  return (
    <div className="right">
      <div className="first_warpper">
        <div className="page">
          <h2>Your Pages and profiles</h2>
          <div className="menu">
            <i className="fa-solid fa-ellipsis"></i>
          </div>
        </div>
        <div className="page_img">
          <img src="image/page.jpg" alt="page" />
          <p>Web Designer</p>
        </div>
        <div className="page_icon">
          <i className="fa-regular fa-bell"></i>
          <p>20 Notifications</p>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
