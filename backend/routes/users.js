var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Đăng ký tài khoản mới
router.post('/register', async (req, res) => {
    try {
        const {
            email,
            password,
            fullName,
        } = req.body;

        // Kiểm tra email đã tồn tại
        const existingUser = await User.findOne({
            email
        });
        if (existingUser) {
            return res.status(400).json({
                message: 'fail'
            }); // Trả về fail nếu email tồn tại
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo người dùng mới
        const newUser = new User({
            email,
            passwordHash: hashedPassword,
            profile: {
                fullName,
            },
        });

        // Lưu vào database
        const savedUser =await newUser.save();

        // Tạo thư mục cho người dùng trong thư mục public/images/{userId}
        const userFolderPath = path.join(__dirname, '../public/images', savedUser._id.toString());
        // Kiểm tra nếu thư mục chưa tồn tại thì tạo mới
        if (!fs.existsSync(userFolderPath)) {
            fs.mkdirSync(userFolderPath, {
                recursive: true
            });
        }

        res.status(201).json({
            message: 'success'
        }); // Trả về success nếu đăng ký thành công
    } catch (err) {
        res.status(500).json({
            message: 'fail'
        }); // Trả về fail nếu có lỗi server
    }
});

// Đảm bảo rằng server có thể truy cập thư mục public/images để trả về ảnh
router.use('/images', express.static(path.join(__dirname, '../public/images')));

// Đăng nhập
// routes/users.js
router.post('/login', async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        // Kiểm tra email có tồn tại không
        const user = await User.findOne({
            email
        });
        if (!user) {
            return res.status(400).json({
                message: 'Email không tồn tại!'
            });
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Sai mật khẩu!'
            });
        }

        // Trả về _id và thông báo đăng nhập thành công
        res.status(200).json({
            message: 'Đăng nhập thành công!',
            userId: user._id
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({
            message: 'Lỗi server, thử lại sau!'
        });
    }
});

router.get('/profile/:userId', async (req, res) =>{
    try{
        const {userId} = req.params;
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        res.status(200).json({
            user: {
                fullName: user.profile.fullName,
                avatarUrl: user.profile.avatarUrl,
                dob: user.profile.dob,
                bio: user.profile.bio,
                location: user.profile.location,
                friends: user.friends
            }
        });
    } catch(err){
        console.error("Error fetching profile", err);
        res.status(500).json({
            message: "Có lỗi xảy ra, thử lại sau"
        })
    }
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const {userId} = req.params;
        const dir = `public/images/${userId}`;  // Đường dẫn thư mục của người dùng

        // Kiểm tra thư mục đã tồn tại chưa, nếu chưa thì tạo mới
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true }); // Tạo thư mục người dùng nếu chưa có
        }

        cb(null, dir); // Chỉ định nơi lưu ảnh
    },
    filename: (req, file, cb) => {
        // Đặt tên cho ảnh (có thể sử dụng thời gian hiện tại hoặc tên file gốc)
        const fileExtension = path.extname(file.originalname); // Lấy phần mở rộng của file
        const filename = `${Date.now()}${fileExtension}`; // Tạo tên file duy nhất
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

router.put("/profile/:userId", upload.single('avatarUrl'), async (req, res) => {
    const {userId} = req.params;
    const {fullName, dob, location, bio} = req.body;
    const user = await User.findById(userId);
    if(!user){
        return res.status(404).json({message: 'User not found'});
    }
    try{
        if (fullName) user.profile.fullName = fullName;
        if (dob) user.profile.dob = dob;
        if (location) user.profile.location = location;
        if (bio) user.profile.bio = bio;
        if (req.file) {
            const avatarUrl = `/images/${userId}/${req.file.filename}`; // Đường dẫn ảnh
            user.profile.avatarUrl = avatarUrl; // Cập nhật đường dẫn ảnh vào cơ sở dữ liệu
        }
        await user.save();
        res.status(200).json({message: 'success'});
    } catch(err){
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });  // Lỗi server
    }
})

// Lấy danh sách tất cả người dùng
router.get('/suggested-friends/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const friends = currentUser.friends;
        const sentRequests = currentUser.sentRequests;  // Lời mời kết bạn đã gửi
        const pendingRequests = currentUser.pendingRequests;  // Lời mời kết bạn đang chờ từ người khác

        // Lọc ra những người chưa kết bạn và chưa nhận lời mời
        const suggestedUsers = await User.find({
            _id: {
                $nin: [...friends, userId, ...sentRequests, ...pendingRequests] // Loại bỏ bạn bè, người đã gửi lời mời và người đã nhận lời mời
            }
        });

        return res.status(200).json(suggestedUsers); // Trả về danh sách người lạ đã cập nhật
    } catch (error) {
        console.error('Error fetching suggested friends:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/friends-request/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = await User.findById(userId).populate({
            path: 'pendingRequests',  // Trường chứa danh sách người gửi lời mời
            select: 'profile.fullName profile.avatarUrl',  // Chọn trường cần thiết
        });
        
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

          // Kiểm tra xem pendingRequests có tồn tại và hợp lệ không
          if (!currentUser.pendingRequests || currentUser.pendingRequests.length === 0) {
            return res.status(200).json([]);  // Trả về mảng rỗng nếu không có lời mời
        }
        
        // Lấy thông tin chi tiết của những người gửi lời mời (danh sách pendingRequests)
        const friendRequests = currentUser.pendingRequests;
        return res.status(200).json(friendRequests);
    } catch (e) {
        console.log("Error fetching friend requests", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


router.post('/send-friend-request', async (req, res) => {
    const { senderId, receiverId } = req.body;

    try {
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        // Kiểm tra nếu đã là bạn bè
        if (sender.friends.includes(receiverId) || receiver.friends.includes(senderId)) {
            return res.status(400).json({ message: "Bạn đã là bạn bè" });
        }

        // Kiểm tra nếu đã gửi lời mời kết bạn
        if (sender.sentRequests.includes(receiverId)) {
            return res.status(400).json({ message: "Lời mời kết bạn đã được gửi" });
        }

        // Thêm người nhận vào sentRequests của người gửi (lời mời đã gửi)
        sender.sentRequests.push(receiverId);
        await sender.save();

        // Thêm người gửi vào pendingRequests của người nhận (lời mời đang chờ)
        receiver.pendingRequests.push(senderId);
        await receiver.save();

        // Lọc lại danh sách người lạ (loại bỏ người đã kết bạn và đã gửi/nhận lời mời)
        const suggestedUsers = await User.find({
            _id: { 
                $nin: [...sender.friends, senderId, receiverId, ...sender.sentRequests, ...receiver.pendingRequests] 
            }
        });

        res.status(200).json({
            message: "Lời mời kết bạn đã được gửi",
            suggestedUsers: suggestedUsers // Trả về danh sách người lạ đã cập nhật
        });

    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ message: "Lỗi khi gửi lời mời kết bạn" });
    }
})

router.post('/accept-friend-request', async (req, res) => {
    try {
        const { userId, friendId } = req.body;

        const currentUser = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!currentUser || !friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Xóa friendId khỏi pendingRequests của currentUser
        currentUser.pendingRequests = currentUser.pendingRequests.filter(
            (id) => !id.equals(friendId)
        );

        // Thêm friendId vào danh sách bạn bè của currentUser
        currentUser.friends.push(friendId);

        // Thêm userId vào danh sách bạn bè của friend
        friend.friends.push(userId);

        // Lưu các thay đổi vào cơ sở dữ liệu
        await currentUser.save();
        await friend.save();

        return res.status(200).json({ message: 'Friend request accepted' });
    } catch (error) {
        console.log('Error accepting friend request:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
})

router.get('/friends/:userId', async (req, res) => {
    const {userId} = req.params;
    try{
        const currentUser = await User.findById(userId).populate({
            path: 'friends',  // Trường chứa danh sách người gửi lời mời
            select: 'profile.fullName profile.avatarUrl',  // Chọn trường cần thiết
        });
        if(!currentUser){
            return res.status(404).json({message: 'User not found'});
        }

        return res.status(200).json(currentUser.friends);
    } catch(e) {
        console.log("Error get friends: ", e);
        return res.status(500).json({message: "Internal Server Error"});
    }
})
// danh sach nguoi la khi tim kiem
router.get('/all', async (req, res) => {
    try {
        // Lấy tất cả người dùng (có thể chọn các trường dữ liệu cần thiết)
        const users = await User.find().select('profile.fullName profile.avatarUrl'); // Chỉnh sửa trường dữ liệu nếu cần
        res.status(200).json(users);
    } catch (err) {
        console.error('Lỗi khi lấy tất cả người dùng:', err);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy dữ liệu người dùng' });
    }
});

// Endpoint để lấy tất cả người dùng
router.get('/all', async (req, res) => {
    try {
        // Lấy tất cả người dùng (có thể chọn các trường dữ liệu cần thiết)
        const users = await User.find().select('profile.fullName profile.avatarUrl'); // Chỉnh sửa trường dữ liệu nếu cần
        res.status(200).json(users);
    } catch (err) {
        console.error('Lỗi khi lấy tất cả người dùng:', err);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy dữ liệu người dùng' });
    }
});

// Đảm bảo rằng server có thể truy cập thư mục public/images để trả về ảnh
router.use('/images', express.static(path.join(__dirname, '../public/images')));

module.exports = router;
