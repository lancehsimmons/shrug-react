import { useState, useEffect } from 'react';
import BlogPost from './BlogPost.js';

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/posts')
      .then(r => r.json())
      .then(setPosts);
  }, []);

  return (
    <div style={{ padding: "32px 24px" }}>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map(post => <BlogPost key={post.id} {...post} />)
      )}
    </div>
  );
}
