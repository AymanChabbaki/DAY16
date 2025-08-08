# Blog Backend API

A RESTful API for a blog application built with Node.js and Express.js, using JSON files for data storage and following the MVC (Model-View-Controller) architecture pattern.

## Features

- **CRUD Operations**: Create, Read, Update, and Delete blog posts
- **JSON File Storage**: Simple file-based data persistence
- **MVC Architecture**: Well-organized code structure
- **Custom Middleware**: Logging and error handling
- **Search Functionality**: Search posts by title, content, author, or tags
- **Filtering**: Filter posts by author or publication status
- **Statistics Endpoint**: Get comprehensive stats about posts

## Project Structure

```
DAY16/
├── app.js                 # Main application file
├── package.json          # Project dependencies and scripts
├── README.md             # Project documentation
├── controllers/          # Request handlers
│   └── postController.js
├── middleware/          # Custom middleware
│   ├── logger.js        # Request logging
│   └── errorHandler.js  # Error handling
├── models/              # Data models
│   └── post.js          # Post model with CRUD operations
├── routes/              # Route definitions
│   └── postRoutes.js    # Post-related routes
└── data/                # JSON data storage
    └── posts.json       # Blog posts data
```

## Installation

1. Clone the repository or download the project files
2. Navigate to the project directory:
   ```bash
   cd DAY16
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 3000 by default. You can access the API at `http://localhost:3000`.

## API Endpoints

### Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API documentation and available endpoints |
| GET | `/api/posts` | Get all posts |
| GET | `/api/posts/:id` | Get a specific post by ID |
| POST | `/api/posts` | Create a new post |
| PUT | `/api/posts/:id` | Update a specific post |
| DELETE | `/api/posts/:id` | Delete a specific post |
| GET | `/api/posts/stats` | Get posts statistics |

### Query Parameters

#### GET `/api/posts`
- `author` - Filter posts by author name
- `published` - Filter by publication status (true/false)
- `search` - Search in title, content, author, or tags

**Examples:**
- `/api/posts?author=John Doe` - Get posts by John Doe
- `/api/posts?published=true` - Get only published posts
- `/api/posts?search=javascript` - Search for "javascript" in posts

## Request/Response Examples

### 1. Create a Post
**POST** `/api/posts`
```json
{
  "title": "My First Blog Post",
  "content": "This is the content of my first blog post. It contains valuable information about web development.",
  "author": "John Doe",
  "tags": ["web development", "javascript", "tutorial"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": "1704067200000abc123",
    "title": "My First Blog Post",
    "content": "This is the content of my first blog post...",
    "author": "John Doe",
    "tags": ["web development", "javascript", "tutorial"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "published": false
  }
}
```

### 2. Get All Posts
**GET** `/api/posts`

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "1704067200000abc123",
      "title": "My First Blog Post",
      "content": "This is the content of my first blog post...",
      "author": "John Doe",
      "tags": ["web development", "javascript", "tutorial"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "published": false
    }
  ]
}
```

### 3. Get a Specific Post
**GET** `/api/posts/1704067200000abc123`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1704067200000abc123",
    "title": "My First Blog Post",
    "content": "This is the content of my first blog post...",
    "author": "John Doe",
    "tags": ["web development", "javascript", "tutorial"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "published": false
  }
}
```

### 4. Update a Post
**PUT** `/api/posts/1704067200000abc123`
```json
{
  "title": "My Updated Blog Post",
  "published": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": {
    "id": "1704067200000abc123",
    "title": "My Updated Blog Post",
    "content": "This is the content of my first blog post...",
    "author": "John Doe",
    "tags": ["web development", "javascript", "tutorial"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:05:00.000Z",
    "published": true
  }
}
```

### 5. Delete a Post
**DELETE** `/api/posts/1704067200000abc123`

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully",
  "data": {
    "id": "1704067200000abc123",
    "title": "My Updated Blog Post",
    "content": "This is the content of my first blog post...",
    "author": "John Doe",
    "tags": ["web development", "javascript", "tutorial"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:05:00.000Z",
    "published": true
  }
}
```

### 6. Get Statistics
**GET** `/api/posts/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPosts": 5,
    "publishedPosts": 3,
    "draftPosts": 2,
    "totalAuthors": 2,
    "totalTags": 8,
    "authors": ["John Doe", "Jane Smith"],
    "tags": ["web development", "javascript", "tutorial", "react", "node.js"]
  }
}
```

## Error Handling

The API includes comprehensive error handling with meaningful error messages:

```json
{
  "error": {
    "message": "Post not found",
    "status": 404,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/posts/invalid-id",
    "method": "GET"
  }
}
```

## Testing with Postman

### Setting up Postman Collection

1. **Create a new collection** called "Blog API"
2. **Set base URL** as environment variable: `http://localhost:3000`

### Test Cases

#### 1. Test Server Status
- **Method**: GET
- **URL**: `{{baseURL}}/`
- **Expected**: 200 status with API documentation

#### 2. Create Multiple Posts
- **Method**: POST
- **URL**: `{{baseURL}}/api/posts`
- **Body**: 
```json
{
  "title": "Getting Started with Node.js",
  "content": "Node.js is a powerful runtime for building server-side applications...",
  "author": "John Doe",
  "tags": ["node.js", "backend", "javascript"]
}
```

#### 3. Test All CRUD Operations
- Create posts (POST)
- Retrieve all posts (GET)
- Retrieve specific post (GET with ID)
- Update post (PUT with ID)
- Delete post (DELETE with ID)

#### 4. Test Query Parameters
- Filter by author: `GET {{baseURL}}/api/posts?author=John Doe`
- Filter published: `GET {{baseURL}}/api/posts?published=true`
- Search posts: `GET {{baseURL}}/api/posts?search=javascript`

#### 5. Test Error Scenarios
- Try to get non-existent post
- Try to update non-existent post
- Try to create post with missing required fields
- Try to delete non-existent post

## Middleware Features

### Logging Middleware
- Logs all incoming requests with timestamp, method, and URL
- Logs request body for POST and PUT requests
- Includes User-Agent information

### Error Handling Middleware
- Catches all application errors
- Provides consistent error response format
- Includes error stack trace in development mode
- Handles different error types appropriately

## Data Model

### Post Schema
```javascript
{
  id: String,           // Unique identifier (auto-generated)
  title: String,        // Post title (required)
  content: String,      // Post content (required)
  author: String,       // Author name (required)
  tags: Array,          // Array of tags (optional)
  createdAt: String,    // ISO timestamp (auto-generated)
  updatedAt: String,    // ISO timestamp (auto-updated)
  published: Boolean    // Publication status (default: false)
}
```

## Development Tips

1. **Use Nodemon**: The project is configured with Nodemon for automatic server restart during development
2. **Check Logs**: The logging middleware provides detailed request information
3. **Error Handling**: All errors are caught and returned in a consistent format
4. **File Storage**: Posts are stored in `data/posts.json` - you can inspect this file to see the data structure

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change the port in `app.js` or set the `PORT` environment variable
   - Kill the process using the port: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`

2. **File Permission Errors**
   - Ensure the application has write permissions to the `data` directory

3. **JSON Parse Errors**
   - If `posts.json` becomes corrupted, delete it and restart the server

## Future Enhancements

- Add user authentication and authorization
- Implement pagination for large datasets
- Add input validation with a library like Joi
- Add database integration (MongoDB, PostgreSQL)
- Implement caching mechanisms
- Add unit and integration tests
- Add API documentation with Swagger

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Happy Coding! 🚀**
