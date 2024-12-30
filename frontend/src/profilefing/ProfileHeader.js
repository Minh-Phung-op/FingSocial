import React, { useEffect, useRef, useState } from 'react';
import '../profile.css';  // File CSS cho trang cá nhân
import axios from 'axios';

const ProfileHeader = ({setIsRenderProfile, isRenderProfile}) => {
  const [isEditProfile, setIsEditProfile] = useState(false);
  const [isEditName, setIsEditName] = useState(false);
  const [isEditDob, setIsEditDob] = useState(false);
  const [isEditLocation, setIsEditLocation] = useState(false);
  const [isEditBio, setIsEditBio] = useState(true);
  const [isEditAvatar, setIsEditAvatar] = useState(false);
  const [placeholderName, setPlaceholderName] = useState(""); 
  const [placeholderDob, setPlaceholderDob] = useState(""); 
  const [placeholderLocation, setPlaceholderLocation] = useState(""); 
  const [imageUrl, setImageUrl] = useState(null);  // State để lưu trữ ảnh
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  //_________________________________________________________________________________
  const profileNameText = useRef();
  const profileDobText = useRef();
  const profileLocationText = useRef();
  const profileNameInput = useRef();
  const profileDobInput = useRef();
  const profileLocationInput = useRef();
  const editNameBtn = useRef();
  const editDobBtn = useRef();
  const editLocationBtn = useRef();
  const editBioBtn = useRef();
  const editBioBao = useRef();
  const profileBioInput = useRef();
  const editImageInput = useRef();
  const editAvatarBtn = useRef();
  const cancelEditNameBtn = useRef();
  const cancelEditDobBtn = useRef();
  const cancelEditLocationBtn = useRef();
  const cancelEditAvatarBtn = useRef();
  const updateNameBtn = useRef();
  const updateDobBtn = useRef();
  const updateLocationBtn = useRef();
  const updateBioBtn = useRef();
  const updateAvatarBtn = useRef();
  // __________________________________________________________________________________
  const handleGetEditProfileModal = () => { // gọi ra modal để edit profile
    setIsEditProfile(true);
  };
  
  const handleCloseEditProfileModal = () => { // đóng modal edit profile
    setIsEditProfile(false);
  };

  const handleClickEditName = () => { // xử lý click edit name
    setIsEditName(true)
  }
  const handleClickEditDob = () => { // xử lý click edit dob
    setIsEditDob(true);
  }
  const handleClickEditLocation = () => { // xử lý click edit location
    setIsEditLocation(true);
  }
  const handleClickEditBio = () => { // xử lý click edit bio
    setIsEditBio(!isEditBio);
  } 
  const handleClickCancelEditName = () => { // xử lý click cancel edit name
    setIsEditName(false)
  }
  const handleClickCancelEditDob = () => { // xử lý click cancel edit dob
    setIsEditDob(false)
  }
  const handleClickCancelEditLocation = () => { // xử lý click cancel edit location
    setIsEditLocation(false)
  }
  const handleClickCancelEditBio = () => { // xử lý click cancel edit bio
    setIsEditBio(!isEditBio)
  }
  const handleClickCancelEditAvatar = () => { // xử lý click cancel edit avatar
    setImageUrl(null)
    setIsEditAvatar(!isEditAvatar)
  }
  const handleFileClick = () => { // Trigger input file khi nhấn button
    editImageInput.current.click(); 
    setIsEditAvatar(!isEditAvatar);
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Tạo URL tạm thời cho ảnh
      const newImageUrl = URL.createObjectURL(file); //Đây là một API của JavaScript tạo ra một URL tạm thời từ đối tượng File. URL này có thể được sử dụng để tham chiếu đến tệp đó trong ứng dụng web mà không cần tải lên server.
      setImageUrl(newImageUrl);  // Cập nhật state với URL của ảnh, newImageUrl là một chuỗi
    }
  };
  const fetchUserProfile = async () => { // lấy ra dữ liệu người dùng
    try{
      const userId = localStorage.getItem('userId');
      if(!userId) {
        window.location.href = '/login';
        return;
      }
      const response = await axios.get(`http://localhost:3001/users/profile/${userId}`)   
      console.log(response);
      
      setUser(response.data.user);
      console.log(user);
      
      setLoading(false);
    } catch (e) {
      console.error("Không lấy được người dùng", e);
      setLoading(false);
    };
  };

  const handleUpdateProfile = async () => {
    const userId = localStorage.getItem('userId'); // Lấy userId từ localStorage
    const file = editImageInput.current.files[0]; // Lấy file ảnh từ input
    const formData = new FormData();
    
    formData.append('avatarUrl', file); // Thêm ảnh vào formData
    formData.append('fullName', profileNameInput.current.value);
    formData.append('dob', profileDobInput.current.value);
    formData.append('location', profileLocationInput.current.value);
    formData.append('bio', profileBioInput.current.value);
  
    try {
      // Gửi yêu cầu PUT để cập nhật thông tin người dùng và ảnh
      const response = await axios.put(`http://localhost:3001/users/profile/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Đảm bảo gửi đúng định dạng multipart
        },
      });
  
      if (response.data.message === 'success') {
        fetchUserProfile(); // Lấy lại thông tin người dùng mới
        setIsEditName(false);
        setIsEditAvatar(false); 
        setIsEditDob(false);
        setIsEditLocation(false);
        setIsEditBio(false);
        setImageUrl(null)
        setIsEditAvatar(false)
        profileNameInput.current.value = ""
        profileDobInput.current.value = ""
        profileLocationInput.current.value = ""
        profileBioInput.current.value = ""
        setIsRenderProfile(!isRenderProfile)
      } else {
        alert('Cập nhật không thành công. Vui lòng thử lại!');
      }
    } catch (err) {
      console.error("Có lỗi xảy ra", err);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };
  
  // userEffect để lấy ra profile data
  useEffect(() => {
    fetchUserProfile();
  }, [])

  // UseEffect này để thay đổi giao diện khi nhấn vào nút chỉnh sửa hoặc hủy
  useEffect(() => {
    if (loading || !user) return;  // Chặn thao tác khi đang tải hoặc không có user
    if(isEditName){  // nếu isEditName là true thì hiển thị input để edit và các nút liên quan
      profileNameText.current.style.display = 'none';
      profileNameInput.current.style.display = 'flex';
      editNameBtn.current.style.display = 'none';
      cancelEditNameBtn.current.style.display = 'flex';
      updateNameBtn.current.style.display = 'flex';
      setPlaceholderName(profileNameText.current.textContent)
    }
    if(!isEditName){ // nếu isEditName là fasle thì quay về trạng thái mặc định
      profileNameText.current.style.display = 'flex';
      profileNameInput.current.style.display = 'none';
      editNameBtn.current.style.display = 'flex';
      cancelEditNameBtn.current.style.display = 'none';
      updateNameBtn.current.style.display = 'none';
    }
    if(isEditDob){ // nếu isEditDob là true thì hiển thị input để edit và những nút liên quan
      profileDobText.current.style.display = 'none';
      profileDobInput.current.style.display = 'flex';
      editDobBtn.current.style.display = 'none';
      cancelEditDobBtn.current.style.display = 'flex'
      updateDobBtn.current.style.display = 'flex';
      setPlaceholderDob(profileDobText.current.textContent)
    }
    if(!isEditDob){ // nếu là false thì mặc định
      profileDobText.current.style.display = 'flex';
      profileDobInput.current.style.display = 'none';
      editDobBtn.current.style.display = 'flex';
      cancelEditDobBtn.current.style.display = 'none'
      updateDobBtn.current.style.display = 'none';
    }
    if(isEditLocation){ // nếu là true thì hiển thị input và những nút liên quan
      profileLocationText.current.style.display = 'none';
      profileLocationInput.current.style.display = 'flex';
      editLocationBtn.current.style.display = 'none';
      cancelEditLocationBtn.current.style.display = 'flex'
      updateLocationBtn.current.style.display = 'flex';
      setPlaceholderLocation(profileLocationText.current.textContent)
    }
    if(!isEditLocation){ // nếu là false thì mặc định
      profileLocationText.current.style.display = 'flex';
      profileLocationInput.current.style.display = 'none';
      editLocationBtn.current.style.display = 'flex';
      cancelEditLocationBtn.current.style.display = 'none'
      updateLocationBtn.current.style.display = 'none';
    }
    if(isEditBio){ // nếu là true thì hiển thị textarea và những nút liên quan
      editBioBao.current.style.display = 'flex';
      editBioBtn.current.textContent = "Hủy"
    }
    if(!isEditBio){ // nếu là fase thì mặc định
      editBioBao.current.style.display = 'none';
      editBioBtn.current.textContent = "Chỉnh sửa"
    }
  }, [isEditName, isEditDob, isEditLocation, isEditBio, isEditAvatar])


  if (loading || !user) {
    return <div>Đang tải...</div>;
  }
  if (!user) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="profile-header"> 
      <div className="cover-photo"> 
        <img src="https://inkythuatso.com/uploads/thumbnails/800/2022/04/nhung-cau-noi-hay-trong-cuoc-song-1-08-09-33-08.jpg" alt="Cover Photo" />
      </div>
      <div className="profile-info">
        <div className="my-profile">
          <div className="profile-avatar-container">
            {user.avatarUrl ? 
              <img src={`http://localhost:3001${user.avatarUrl}`} alt="Avatar" className="profile-avatar" />
              :
              <img  alt="Avatar" className="profile-avatar" src='https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg'/>
            } 
            
          </div>
          <div className="profile-text">
            <h2>{user.fullName}</h2>
            <p>{user.friends.length} người bạn</p>
            {/* <div className="friends-list">
              <img src="https://www.enewsletterhome.com/_eNewsletter/2020/2007_J_avatar.jpg?" alt="Friend 1" />
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7LhzAUe70LbbnwUpidBy0Ut2LCZSC6-SZbaca5H9qVLkgaD22tTkv7Rp3Ijdd_e4-M3s&usqp=CAU" alt="Friend 2" />
              <img src="https://i.redd.it/the-facebook-avatars-what-is-going-on-v0-kxbwuehwsrib1.jpg?width=1076&format=pjpg&auto=webp&s=2e54622704ac695437258c70af9deff77bbe2d36" alt="Friend 3" />
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcpP3Pr4s7y_-bYXo0MOrWKI71Ck0N0u_xOR3PCfOpVxP0L5x0ubMfCRWWWyLxryY8_Ng&usqp=CAU" alt="Friend 4" />
            </div> */}
          </div>
        </div>
        <div className="action-buttons">
          {/* <button className="edit-profile-btn"> Thêm vào tin</button> */}
          <button className="add-to-story-btn" onClick={handleGetEditProfileModal}><i className="fa-solid fa-pen"></i> Chỉnh sửa trang cá nhân</button>
        </div>
      </div>
      {isEditProfile && <div onClick={handleCloseEditProfileModal} className="modalBackdrop"></div>}
        <div onClick={(e) => e.stopPropagation()} className={isEditProfile ? 'modalEditProfile' : 'modalEditProfileHidden'}>
          <h2>Chỉnh sửa trang cá nhân</h2>
          <br/><hr/><br/>
          {/* Cụm edit avatar */}
          <div className='avartarProfileEditContainer'>
            <div className='avartarProfileEditTitle'>
              <h3>Ảnh đại diện</h3>
              <div className='avatarImageAction'>
                {isEditAvatar && 
                <>
                  <button type='button' onClick={handleClickCancelEditAvatar} ref={cancelEditAvatarBtn}>Hủy</button>
                  <button type='button' onClick={handleUpdateProfile} ref={updateAvatarBtn}>Cập nhật</button>
                </> 
                }
                {!isEditAvatar &&
                  <button type='file' onClick={handleFileClick} ref={editAvatarBtn}>Chỉnh sửa</button>
                }
              </div>
              <input type="file" ref={editImageInput} style={{ display: 'none' }} accept="image/*" onChange={handleImageChange}/>
            </div>
            <br/>
            <div className='avatarProfileEditImage'>
              {/* <img src="https://scontent.fhan20-1.fna.fbcdn.net/v/t39.30808-1/449448454_1213423926752474_2350877371893536620_n.jpg?stp=c271.0.563.563a_dst-jpg_s200x200_tt6&_nc_cat=109&ccb=1-7&_nc_sid=0ecb9b&_nc_eui2=AeFGrjBDVzamws3Fy3Q-QstwN764PdZJAGY3vrg91kkAZr-3Cs_S1nEEaam2OiSFtGBIwFeYcjv1uCWGiFnkfgdo&_nc_ohc=CXj62EeXVysQ7kNvgFWxD-G&_nc_zt=24&_nc_ht=scontent.fhan20-1.fna&_nc_gid=AOgqVAamXAFhPSd03hdkrw5&oh=00_AYAFI9WR3ez1928q1oSDrL4ZVbuOObp2_OB22Vu1qmVDeQ&oe=675FB281" alt="Avatar" /> */}
              {imageUrl ? (
                <img src={imageUrl} alt="Avatar" />
              ) : (
                user.avatarUrl ? 
                <img src={`http://localhost:3001${user.avatarUrl}`} alt="Avatar" />
                : 
                <img src="https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg" alt="Avatar" />
              )}
            </div>
          </div>
          <br/><br/>
          {/* Cụm edit thông tin cá nhân (giới thiệu) */}
          <div className='infoEditProfileContainer'>
            <div className='avartarProfileEditTitle'>
                <h3>Giới thiệu</h3>
            </div>
            <br/>
            <div className='infoEditProfileContent'>
              {/* Cụm edit name */}
              <div className='infoEditProfileName'>
                <div>
                  <i className="fa-solid fa-user"></i>
                  <p ref={profileNameText}>{user.fullName}</p>
                  <input ref={profileNameInput} type="text" className='editProfileInput' placeholder={placeholderName}/>
                </div>
                <div className='actionSpan'>
                  <span onClick={handleClickEditName} ref={editNameBtn}>Chỉnh sửa</span>  
                  <span ref={cancelEditNameBtn} onClick={handleClickCancelEditName} className='cancelEdit'>Hủy</span>  
                  <span ref={updateNameBtn} onClick={handleUpdateProfile} className='updateEdit'>Cập nhật</span>  
                </div>
              <div>
                </div>
              </div>
              <br/>
              {/* Cụm edit dob */}
              <div className='infoEditProfileName'>
                <div>
                  <i className="fa-solid fa-cake-candles"></i>
                  <p ref={profileDobText}>{!user.dob ? "chưa có" : user.dob}</p>
                  <input ref={profileDobInput} type="text" className='editProfileInput' placeholder={user.dob ?  placeholderDob : ""}/>
                </div>
                <div className='actionSpan'>
                  <span onClick={handleClickEditDob} ref={editDobBtn}>Chỉnh sửa</span>  
                  <span ref={cancelEditDobBtn} onClick={handleClickCancelEditDob} className='cancelEdit'>Hủy</span>  
                  <span ref={updateDobBtn} onClick={handleUpdateProfile} className='updateEdit'>Cập nhật</span>  
                </div>
              <div>     
                </div>
              </div>
              <br/>
              {/* Cụm edit loctation */}
              <div className='infoEditProfileName'>
                <div>
                <i className="fa-solid fa-location-dot"></i>
                  <p ref={profileLocationText}>{!user.location ? "chưa có" : user.location }</p>
                  <input ref={profileLocationInput} type="text" className='editProfileInput' placeholder={user.location ? placeholderLocation : ""}/>
                </div>
                <div className='actionSpan'>
                  <span onClick={handleClickEditLocation} ref={editLocationBtn}>Chỉnh sửa</span>  
                  <span ref={cancelEditLocationBtn} onClick={handleClickCancelEditLocation} className='cancelEdit'>Hủy</span>  
                  <span ref={updateLocationBtn} onClick={handleUpdateProfile} className='updateEdit'>Cập nhật</span>  
                </div>
              <div>
                </div>
              </div>
            </div>
          </div>
          <br/><br/>
          {/* Cụm edit tiểu sử (bio) */}
          <div className='avartarProfileEditContainer'>
            <div className='avartarProfileEditTitle'>
              <h3>Tiểu sử</h3>
              <button ref={editBioBtn} onClick={handleClickEditBio}>Chỉnh sửa</button>
            </div>
            <br/>
            <div className='profileEditBioContainer'>
              <p>{user.bio? user.bio : "Mô tả bản thân ..."}</p>
              <div className='editBioBao' ref={editBioBao}>
                {/* <div> */}
                  <textarea ref={profileBioInput}></textarea>
                {/* </div> */}
                <div className='bioEditAction'>
                  <button type='button' className='closeEditBio' onClick={handleClickCancelEditBio}>Hủy</button>
                  <button type='button' ref={updateBioBtn} onClick={handleUpdateProfile} className='updateEditBio'>Lưu</button>
                </div>
              </div>
            </div>
          </div>
          <br />
        </div>
    </div>
  );
};

export default ProfileHeader;
