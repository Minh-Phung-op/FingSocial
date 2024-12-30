import React from 'react';
import '../index.css';
const StoryCard = ({ img, name }) => {
  return (
    <div className='story_cardContainer'>
      <div className="story_card">
        <img src="./image/profile_1.png" alt="Story" />
        <div className="story_profile">
          <img src="./image/profile_1.png" alt="Profile" />
          <div className="circle"></div>
        </div>
        <div className="story_name">
          <p className="name">{name}</p>
        </div>
      </div>

      <div className="story_card">
        <img src="./image/detective1.jpg" alt="Story" />
        <div className="story_profile">
          <img src="./image/purple.jpg" alt="Profile" />
          <div className="circle"></div>
        </div>
        <div className="story_name">
          <p className="name">{name}</p>
        </div>

      </div>
      
      <div className="story_card">
        <img src="./image/profile_3.jpg" alt="Story" />
        <div className="story_profile">
          <img src="./image/profile_3.jpg" alt="Profile" />
          <div className="circle"></div>
        </div>
        <div className="story_name">
          <p className="name">{name}</p>
        </div>

      </div>
      <div className="story_card">
        <img src="./image/profile_4.png" alt="Story" />
        <div className="story_profile">
          <img src="./image/profile_4.png" alt="Profile" />
          <div className="circle"></div>
        </div>
        <div className="story_name">
          <p className="name">{name}</p>
        </div>

      </div>
      <div className="story_card">
        <img src="./image/profile_5.png" alt="Story" />
        <div className="story_profile">
          <img src="./image/profile_5.png" alt="Profile" />
          <div className="circle"></div>
        </div>
        <div className="story_name">
          <p className="name">{name}</p>
        </div>

      </div>
    </div>
  );
};

export default StoryCard;
