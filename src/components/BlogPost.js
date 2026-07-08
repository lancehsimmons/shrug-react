import { renderBodyWithLinks } from '../utils/linkify.js';
import './BlogPost.css';

export default function BlogPost({ title, body, image_urls, audio_urls, created_at }) {
  return (
    <div className="blog-post">
      <h2 className="blog-post-title">{title}</h2>
      <p className="blog-post-date">
        {new Date(created_at).toLocaleDateString()}
      </p>
      {image_urls.length > 0 && (
        <div className="blog-post-images">
          {image_urls.map((url, i) => (
            <img key={i} src={url} alt="" className="blog-post-image" />
          ))}
        </div>
      )}
      <p className="blog-post-body">{renderBodyWithLinks(body)}</p>
      {audio_urls.length > 0 && (
        <ul className="blog-post-audio-list">
          {audio_urls.map((url, i) => (
            <li key={i} className="blog-post-audio-item">
              <audio src={url} controls />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
