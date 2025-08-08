const express = require('express');
const PostController = require('../controllers/postController');

const router = express.Router();

/**
 * Blog Post Routes
 * All routes are prefixed with /api/posts
 */

// GET /api/posts/stats - Get posts statistics (must be before /:id route)
router.get('/stats', PostController.getPostsStats);

// GET /api/posts - Get all posts (supports query parameters: author, published, search)
router.get('/', PostController.getAllPosts);

// GET /api/posts/:id - Get a specific post by ID
router.get('/:id', PostController.getPostById);

// POST /api/posts - Create a new post
router.post('/', PostController.createPost);

// PUT /api/posts/:id - Update a specific post
router.put('/:id', PostController.updatePost);

// DELETE /api/posts/:id - Delete a specific post
router.delete('/:id', PostController.deletePost);

module.exports = router;
