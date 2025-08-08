const Post = require('../models/post');

/**
 * Post Controller
 * Handles all HTTP requests related to blog posts
 */
class PostController {
    /**
     * Get all posts
     * GET /api/posts
     */
    static async getAllPosts(req, res, next) {
        try {
            const { author, published, search } = req.query;
            let posts;

            if (search) {
                posts = await Post.searchPosts(search);
            } else if (author) {
                posts = await Post.getPostsByAuthor(author);
            } else if (published === 'true') {
                posts = await Post.getPublishedPosts();
            } else {
                posts = await Post.getAllPosts();
            }

            res.status(200).json({
                success: true,
                count: posts.length,
                data: posts
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a single post by ID
     * GET /api/posts/:id
     */
    static async getPostById(req, res, next) {
        try {
            const { id } = req.params;
            const post = await Post.getPostById(id);

            if (!post) {
                return res.status(404).json({
                    success: false,
                    message: 'Post not found'
                });
            }

            res.status(200).json({
                success: true,
                data: post
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new post
     * POST /api/posts
     */
    static async createPost(req, res, next) {
        try {
            const { title, content, author, tags } = req.body;

            // Validation
            if (!title || !content || !author) {
                return res.status(400).json({
                    success: false,
                    message: 'Title, content, and author are required'
                });
            }

            const newPost = await Post.createPost({
                title: title.trim(),
                content: content.trim(),
                author: author.trim(),
                tags: tags || []
            });

            res.status(201).json({
                success: true,
                message: 'Post created successfully',
                data: newPost
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a post
     * PUT /api/posts/:id
     */
    static async updatePost(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Check if post exists
            const existingPost = await Post.getPostById(id);
            if (!existingPost) {
                return res.status(404).json({
                    success: false,
                    message: 'Post not found'
                });
            }

            // Validate update data
            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No update data provided'
                });
            }

            const updatedPost = await Post.updatePost(id, updateData);

            res.status(200).json({
                success: true,
                message: 'Post updated successfully',
                data: updatedPost
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a post
     * DELETE /api/posts/:id
     */
    static async deletePost(req, res, next) {
        try {
            const { id } = req.params;

            // Check if post exists
            const existingPost = await Post.getPostById(id);
            if (!existingPost) {
                return res.status(404).json({
                    success: false,
                    message: 'Post not found'
                });
            }

            const deletedPost = await Post.deletePost(id);

            res.status(200).json({
                success: true,
                message: 'Post deleted successfully',
                data: deletedPost
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get posts statistics
     * GET /api/posts/stats
     */
    static async getPostsStats(req, res, next) {
        try {
            const allPosts = await Post.getAllPosts();
            const publishedPosts = allPosts.filter(post => post.published);
            const draftPosts = allPosts.filter(post => !post.published);

            // Get authors
            const authors = [...new Set(allPosts.map(post => post.author))];

            // Get all tags
            const allTags = allPosts.flatMap(post => post.tags || []);
            const uniqueTags = [...new Set(allTags)];

            res.status(200).json({
                success: true,
                data: {
                    totalPosts: allPosts.length,
                    publishedPosts: publishedPosts.length,
                    draftPosts: draftPosts.length,
                    totalAuthors: authors.length,
                    totalTags: uniqueTags.length,
                    authors: authors,
                    tags: uniqueTags
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PostController;
