import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BlogPost from './BlogPost.js';

export default function BlogPreview() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const adminKey = localStorage.getItem('adminKey');
    if (!adminKey) {
      setError('Not logged in — visit /admin first.');
      return;
    }
    fetch(`http://localhost:4000/api/posts/${id}`, {
      headers: { 'x-admin-key': adminKey },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setPost)
      .catch(() => setError('Post not found.'));
  }, [id]);

  return (
    <div style={{ padding: '32px 24px' }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!post && !error && <p>Loading...</p>}
      {post && (
        <>
          {post.status === 'draft' && (
            <p style={{ marginBottom: '24px', fontStyle: 'italic', color: '#888' }}>Draft preview — not yet published</p>
          )}
          <BlogPost {...post} />
        </>
      )}
    </div>
  );
}
