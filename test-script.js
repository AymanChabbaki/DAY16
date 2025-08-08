/**
 * Test Script for Blog API
 * This script demonstrates all the CRUD operations and features of the Blog API
 */

const baseURL = 'http://localhost:3000';

console.log('🧪 Blog API Test Script');
console.log('========================\n');

// Test 1: Get API Info
console.log('1. Testing API Info...');
console.log(`GET ${baseURL}/`);
console.log('Expected: API documentation and endpoints\n');

// Test 2: Create Posts
console.log('2. Testing Create Posts...');
console.log(`POST ${baseURL}/api/posts`);

const testPosts = [
    {
        title: "Introduction to Node.js",
        content: "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It allows developers to run JavaScript on the server side.",
        author: "Alice Johnson",
        tags: ["nodejs", "javascript", "backend"]
    },
    {
        title: "Express.js Fundamentals",
        content: "Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.",
        author: "Bob Wilson",
        tags: ["express", "nodejs", "web framework"]
    },
    {
        title: "RESTful API Design",
        content: "REST (Representational State Transfer) is an architectural style for designing networked applications. In this post, we'll explore the principles of RESTful API design.",
        author: "Alice Johnson",
        tags: ["rest", "api", "design", "backend"]
    }
];

console.log(`Creating ${testPosts.length} test posts...\n`);

// Test 3: Get All Posts
console.log('3. Testing Get All Posts...');
console.log(`GET ${baseURL}/api/posts`);
console.log('Expected: List of all created posts\n');

// Test 4: Search Posts
console.log('4. Testing Search Functionality...');
console.log(`GET ${baseURL}/api/posts?search=nodejs`);
console.log('Expected: Posts containing "nodejs"\n');

// Test 5: Filter by Author
console.log('5. Testing Filter by Author...');
console.log(`GET ${baseURL}/api/posts?author=Alice Johnson`);
console.log('Expected: Posts by Alice Johnson\n');

// Test 6: Get Post by ID
console.log('6. Testing Get Post by ID...');
console.log(`GET ${baseURL}/api/posts/{id}`);
console.log('Expected: Specific post details\n');

// Test 7: Update Post
console.log('7. Testing Update Post...');
console.log(`PUT ${baseURL}/api/posts/{id}`);
console.log('Body: { "published": true, "title": "Updated Title" }');
console.log('Expected: Updated post with new values\n');

// Test 8: Get Statistics
console.log('8. Testing Statistics...');
console.log(`GET ${baseURL}/api/posts/stats`);
console.log('Expected: Post statistics including counts and authors\n');

// Test 9: Get Published Posts
console.log('9. Testing Filter Published Posts...');
console.log(`GET ${baseURL}/api/posts?published=true`);
console.log('Expected: Only published posts\n');

// Test 10: Delete Post
console.log('10. Testing Delete Post...');
console.log(`DELETE ${baseURL}/api/posts/{id}`);
console.log('Expected: Confirmation of deletion\n');

// Test 11: Error Handling
console.log('11. Testing Error Handling...');
console.log(`GET ${baseURL}/api/posts/invalid-id`);
console.log('Expected: 404 error with proper error message\n');

console.log('📋 Test Instructions:');
console.log('=====================');
console.log('1. Make sure the server is running: npm run dev');
console.log('2. Use Postman or any HTTP client to test the endpoints');
console.log('3. Import the Postman collection from: postman/Blog_API_Collection.json');
console.log('4. Set the baseURL variable to: http://localhost:3000');
console.log('5. Run the tests in the order listed above');
console.log('6. Check the data/posts.json file to see the stored data\n');

console.log('🔍 What to Verify:');
console.log('==================');
console.log('✅ Server starts without errors');
console.log('✅ All CRUD operations work correctly');
console.log('✅ Search and filtering work as expected');
console.log('✅ Error handling returns proper error messages');
console.log('✅ Middleware logs requests to console');
console.log('✅ Data persists in posts.json file');
console.log('✅ Statistics endpoint returns accurate data');

module.exports = {
    baseURL,
    testPosts
};
