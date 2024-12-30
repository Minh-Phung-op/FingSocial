var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
    email: { 
        type: String, 
        required: true,  // Email là bắt buộc
        unique: true     // Email phải là duy nhất
    },
    passwordHash: { 
        type: String, 
        required: true    // Mã băm mật khẩu là bắt buộc
    },
    profile: {           // Thông tin trang cá nhân
      fullName: String,
      bio: String,       // Mô tả bản thân
      avatarUrl: String, // Đường dẫn hình đại diện
      dob: String,         // Ngày sinh
      location: String,  // Địa điểm
    },
    friends:  [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users'  // Mảng các ID người dùng đã kết bạn (liên kết với collection Users)
    }],
    pendingRequests: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users'  // Mảng các ID người dùng có lời mời kết bạn chưa được chấp nhận
    }],
    sentRequests: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users'  // Mảng các ID người dùng có lời mời kết bạn chưa được chấp nhận
    }]
},{ 
    timestamps: true  // Tự động tạo và cập nhật các trường createdAt và updatedAt
});

var UserModel = mongoose.model('Users', UserSchema);
module.exports = UserModel;