const fs = require('fs').promises;
const path = require('path');

// Path to the JSON file that stores blog posts
const POSTS_FILE = path.join(__dirname, '..', 'data', 'posts.json');

/**
 * Post Model
 * Handles all CRUD operations for blog posts using JSON file storage
 */
class Post {
    constructor(title, content, author, tags = []) {
        this.id = this.generateId();
        this.title = title;
        this.content = content;
        this.author = author;
        this.tags = tags;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
        this.published = false;
    }

    /**
     * Generate a unique ID for the post
     */
    generateId() {
        return Date.now().toString() + Math.random().toString(36).substring(2);
    }

    /**
     * Read all posts from the JSON file
     */
    static async getAllPosts() {
        try {
            const data = await fs.readFile(POSTS_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist, return empty array
                return [];
            }
            throw error;
        }
    }

    /**
     * Write posts to the JSON file
     */
    static async savePosts(posts) {
        try {
            await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
        } catch (error) {
            throw new Error(`Failed to save posts: ${error.message}`);
        }
    }

    /**
     * Get a post by ID
     */
    static async getPostById(id) {
        const posts = await this.getAllPosts();
        return posts.find(post => post.id === id);
    }

    /**
     * Create a new post
     */
    static async createPost(postData) {
        const { title, content, author, tags } = postData;
        
        // Validate required fields
        if (!title || !content || !author) {
            throw new Error('Title, content, and author are required');
        }

        const posts = await this.getAllPosts();
        const newPost = new Post(title, content, author, tags);
        
        posts.push(newPost);
        await this.savePosts(posts);
        
        return newPost;
    }

    /**
     * Update a post by ID
     */
    static async updatePost(id, updateData) {
        const posts = await this.getAllPosts();
        const postIndex = posts.findIndex(post => post.id === id);
        
        if (postIndex === -1) {
            throw new Error('Post not found');
        }

        // Update allowed fields
        const allowedFields = ['title', 'content', 'author', 'tags', 'published'];
        const updatedPost = { ...posts[postIndex] };
        
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updatedPost[field] = updateData[field];
            }
        });

        updatedPost.updatedAt = new Date().toISOString();
        posts[postIndex] = updatedPost;
        
        await this.savePosts(posts);
        return updatedPost;
    }

    /**
     * Delete a post by ID
     */
    static async deletePost(id) {
        const posts = await this.getAllPosts();
        const postIndex = posts.findIndex(post => post.id === id);
        
        if (postIndex === -1) {
            throw new Error('Post not found');
        }

        const deletedPost = posts[postIndex];
        posts.splice(postIndex, 1);
        
        await this.savePosts(posts);
        return deletedPost;
    }

    /**
     * Search posts by title or content
     */
    static async searchPosts(query) {
        const posts = await this.getAllPosts();
        const searchTerm = query.toLowerCase();
        
        return posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            post.author.toLowerCase().includes(searchTerm) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    /**
     * Get posts by author
     */
    static async getPostsByAuthor(author) {
        const posts = await this.getAllPosts();
        return posts.filter(post => 
            post.author.toLowerCase() === author.toLowerCase()
        );
    }

    /**
     * Get published posts only
     */
    static async getPublishedPosts() {
        const posts = await this.getAllPosts();
        return posts.filter(post => post.published === true);
    }
}

module.exports = Post;
