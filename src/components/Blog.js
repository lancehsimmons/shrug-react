import { useState, useEffect } from 'react';
import BlogPost from './BlogPost.js';
import { API_BASE_URL } from '../config.js';
import './Blog.css';

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/posts`)
      .then(r => r.json())
      .then(setPosts);
  }, []);

  return (
    <div className="blog-page">
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map(post => <BlogPost key={post.id} {...post} />)
      )}
    </div>
  );
}
