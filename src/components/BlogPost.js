export default function BlogPost({ title, body, image_urls, audio_urls, created_at }) {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto 48px", textAlign: "left" }}>
      <h2 style={{ margin: "0 0 4px" }}>{title}</h2>
      <p style={{ fontSize: "14px", color: "#666", margin: "0 0 16px" }}>
        {new Date(created_at).toLocaleDateString()}
      </p>
      {image_urls.length > 0 && (
        <div style={{ margin: "16px 0" }}>
          {image_urls.map((url, i) => (
            <img key={i} src={url} alt="" style={{ maxWidth: "100%", display: "block", marginBottom: "8px" }} />
          ))}
        </div>
      )}
      <p style={{ whiteSpace: "pre-wrap", margin: "0 0 16px" }}>{body}</p>
      {audio_urls.length > 0 && (
        <ul style={{ paddingLeft: 20 }}>
          {audio_urls.map((url, i) => (
            <li key={i} style={{ marginBottom: "8px" }}>
              <audio src={url} controls />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
