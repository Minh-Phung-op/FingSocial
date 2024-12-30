const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const postController = require('../controllers/postController');
const router = express.Router();

// Cấu hình Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { userId } = req.params; // Lấy userId từ params
    const dir = `public/images/${userId}`;

    // Kiểm tra và tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir); // Chỉ định nơi lưu file
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname); // Lấy đuôi file
    const filename = `${Date.now()}${fileExtension}`; // Tạo tên file duy nhất
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

// Route xử lý tạo bài viết
router.post('/:userId', upload.single('imageUrl'), postController.createPost);

// Route: Get all posts
router.get('/', postController.getAllPosts);

router.get('/filterPosts/:userId', postController.getFilterPosts);

// Route: Get a single post
router.get('/:id', postController.getPostById);

// Route: Delete a post
router.delete('/:id', postController.deletePost);

// Route: Like a post
router.put('/like/:postId', postController.likePost);

// Router: get post by user
router.get('/user/:userId', postController.getPostByUser);

// Add comment to post
router.post('/:postId/comment', postController.addComment);

router.get('/:postId/comments', postController.getComments);

router.delete('/:postId/comments/:commentId', postController.deleteComment);

router.put('/:postId/comments/:commentId', postController.editComment);
// Update a comment
// router.put('/:postId/comment/:commentId', postController.editComment);


// Route: Update a post
router.put('/:userId/:id', upload.single('imageUrl'), postController.updatePost);


module.exports = router;