var mongoose = require('mongoose');

var PostSchema = mongoose.Schema({
    userId: {  // ID người dùng đăng bài (liên kết với collection User)
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users'
    },
    content: String, // Nội dung bài viết
    imageUrl: String, // Đường dẫn ảnh (nếu có)
    status: { 
        type: String, 
        enum: ['friends', 'everyone'],  // "friends" hoặc "everyone"
        default: 'friends'  // Mặc định là "friends"
    }, 
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users'  // Mảng các ID người dùng thích bài đăng (liên kết với collection Users)
    }],
    comments: [{  // Mảng các comment
        userId: { 
            type: mongoose.Schema.Types.ObjectId,  // ID người bình luận
            ref: 'Users'  // Liên kết với collection Users
        },
        content: { 
            type: String, 
            required: true  // Nội dung bình luận
        },
        createdAt: { 
            type: Date, 
            default: Date.now  // Thời gian bình luận
        }
    }],
}, { 
    timestamps: true  // Tự động tạo và cập nhật các trường createdAt và updatedAt
})

var PostModel = mongoose.model('Posts', PostSchema);
module.exports = PostModel;