const Post = require('../models/Post');
const User = require('../models/User');
const { response } = require('express');

const postController = {
  // Get all posts
  getAllPosts: async (req, res) => {
    try {
      const posts = await Post.find()
        .populate('userId', 'profile.fullName profile.avatarUrl')
        .sort({ createdAt: -1 });
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getFilterPosts: async (req, res) => {
    try {
      const {userId} = req.params; // ID người dùng từ token hoặc session (giả sử có userId)

      // Tìm người dùng theo userId để lấy danh sách bạn bè
      const user = await User.findById(userId);
      
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Lấy danh sách bài viết
      const posts = await Post.find({
          // Điều kiện để lọc các bài viết
          $or: [
              { userId: { $in: user.friends } },   // Lọc các bài viết từ bạn bè
              { status: 'everyone' }                 // Lọc các bài viết có status là 'everyone'
          ]
      })
      .populate('userId', 'profile.fullName profile.avatarUrl')  // Lấy thông tin người đăng bài
      .populate('likes', 'profile.fullName')  // Lấy thông tin người thích bài
      .populate('comments.userId', 'profile.fullName')  // Lấy thông tin người bình luận
      .sort({ createdAt: -1 });  // Sắp xếp bài viết mới nhất lên đầu

      // Trả về kết quả
      res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
  },

  // Get single post
  getPostById: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id)
        .populate('userId', 'profile.fullName profile.avatarUrl');
      res.json(post);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  
  // Create a new post
  createPost: async (req, res) => {
    try {
      const { userId } = req.params;
      const { content, status } = req.body; // Lấy content và status từ body
  
      // Kiểm tra nếu có file ảnh
      let imageUrl = null;
      if (req.file) {
        imageUrl = `/images/${userId}/${req.file.filename}`; // Đường dẫn file ảnh đã được lưu
      }
  
      // Lưu bài viết vào cơ sở dữ liệu (Giả sử bạn đã tạo model Post)
      const newPost = new Post({
        userId: userId,
        content: content,
        status: status,
        imageUrl: imageUrl, // Lưu đường dẫn ảnh nếu có
        createdAt: new Date(),
      });
  
      await newPost.save();
  
      res.status(201).json({
        message: 'Post created successfully!',
        Post: newPost,
      });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ message: 'Error creating post', error: error.message });
    }
  },
  // Delete a post
  deletePost: async (req, res) => {
    try {
      const { id } = req.params; // Lấy ID bài viết từ URL
      const userId = req.body.userId; // Lấy userId từ yêu cầu

      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Kiểm tra quyền sở hữu
      if (post.userId.toString() !== userId) {
        return res.status(403).json({ message: "You are not authorized to delete this post" });
      }

      // Xóa bài viết
      await Post.findByIdAndDelete(id);

      res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
      console.error("Error deleting post:", err.message);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  // Update an existing post
  updatePost: async (req, res) => {
    try {
      const { userId, id } = req.params; // Lấy userId và id từ params
      const { content, status } = req.body;

      const imageUrl = req.file ? `/images/${userId}/${req.file.filename}` : undefined; // Lưu đường dẫn ảnh mới

      if (!content) {
        return res.status(400).json({ message: 'Content is required' });
      }

      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Kiểm tra quyền sở hữu
      if (post.userId.toString() !== userId) {
        return res.status(403).json({ message: 'You are not authorized to update this post' });
      }

      // Cập nhật bài viết
      post.content = content;
      post.status = status || post.status;
      if (imageUrl) {
        post.imageUrl = imageUrl;
      }

      const updatedPost = await post.save();
      const populatedPost = await updatedPost.populate('userId', 'profile.fullName profile.avatarUrl');
      res.json(populatedPost);
    } catch (err) {
      console.error('Error updating post:', err.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  likePost: async (req, res) => {
    try{
      const {postId} = req.params
      const {userId} = req.body
      if(!userId) {
        return res.status(404).json({ message: 'User not found' });
      }

      const post = await Post.findById(postId);
      if(!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // kiểm tra user đã like bài viết chưa
      const isLiked = post.likes.includes(userId);
      if(isLiked){
        // nếu like rồi thì gỡ like
        post.likes = post.likes.filter(like => like.toString() !== userId)
      } else{
        post.likes.push(userId);
      }

      await post.save();
      return res.json(post);
    } catch (err) {
      console.log(err);
      return res.status(500).json({message: "Server error"})
    }
  },

  getPostByUser: async (req, res) => {
    try {
      const userId = req.params.userId; // Lấy userId từ URL params
      const posts = await Post.find({ userId })
      .populate('userId', 'profile.fullName profile.avatarUrl') // Lấy thông tin người dùng (fullName, avatarUrl, bio)
      .populate('likes', 'profile.fullName profile.avatarUrl') // Nếu cần lấy thông tin những người thích bài viết
      .populate('comments.userId', 'profile.fullName profile.avatarUrl') // Lấy thông tin người bình luận; // Lọc bài viết theo userId
      .sort({ createdAt: -1 });

      res.json(posts); // Trả về các bài viết
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ message: 'Error fetching posts' });
    }
  },

  // Add a comment to a post
// Add comment to a post
// Add comment to a post
addComment: async (req, res) => {
  try {
    const { postId } = req.params; // Lấy postId từ params
    const { userId, content } = req.body; // Lấy userId và nội dung bình luận từ body

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Thêm bình luận vào bài viết
    const newComment = {
      userId,
      content,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Populate thông tin userId trong comment sau khi thêm comment mới
    await post.populate({
      path: 'comments.userId', // Populate userId trong comments
      select: 'profile.avatarUrl profile.fullName', // Lấy avatarUrl và fullName
    });

    // Trả về bình luận mới được thêm, bao gồm thông tin userId (avatarUrl, fullName)
    const addedComment = post.comments[post.comments.length - 1]; // Lấy bình luận mới nhất
    res.status(201).json(addedComment); // Trả về comment đã populate đầy đủ thông tin người dùng
  } catch (err) {
    console.error('Error adding comment:', err.message);
    res.status(500).json({ message: 'Error adding comment' });
  }
},


getComments: async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId)
  .populate({
    path: 'comments.userId', // Populate userId trong comments
    select: 'profile.fullName profile.avatarUrl ', // Chỉ lấy avatarUrl và fullName
  });


    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post.comments);
  } catch (error) {
    console.error('Error fetching comments:', error.message);
    res.status(500).json({ message: 'Error fetching comments' });
  }
},
// Delete a comment
deleteComment: async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req.body; // userId từ body
    console.log("Sending userId:", userId);
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // const comment = post.comments.id(commentId); // Tìm comment theo ID 
    // console.log(comment); 
    
    if (!post.comments) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Kiểm tra nếu userId là của người tạo bình luận hoặc chủ bài viết
    if (post.userId.toString() !== userId && post.comments.id(commentId).userId.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this comment' });
    }

    // Xóa bình luận
    post.comments = post.comments.filter(c => c.id !== commentId);
    await post.save();


    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
},
editComment: async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId, content } = req.body; // Lấy userId và nội dung mới từ body

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Kiểm tra nếu userId là của người tạo bình luận hoặc chủ bài viết
    if (post.userId.toString() !== userId && comment.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to edit this comment' });
    }

    // Cập nhật nội dung bình luận
    comment.content = content; // Cập nhật nội dung
    await post.save(); // Lưu lại thay đổi

    res.status(200).json({ message: 'Comment updated successfully' });
  } catch (err) {
    console.error('Error editing comment:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
},


};

module.exports = postController;