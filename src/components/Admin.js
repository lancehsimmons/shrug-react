import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:4000';

const sectionStyle = {
  maxWidth: 640,
  margin: '0 auto 48px',
  textAlign: 'left',
};

const fieldStyle = {
  display: 'block',
  width: '100%',
  marginBottom: '16px',
  fontSize: '16px',
  padding: '6px 8px',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontWeight: 'bold',
  marginBottom: '4px',
  fontSize: '14px',
};

const btnStyle = {
  padding: '8px 20px',
  fontSize: '16px',
  cursor: 'pointer',
};

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      {hint && <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px' }}>{hint}</p>}
      {children}
    </div>
  );
}

// ── Login ────────────────────────────────────────────────────────────────────

function Login({ onLogin }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch(`${API}/api/orders`, { headers: { 'x-admin-key': key } });
    if (res.ok) {
      localStorage.setItem('adminKey', key);
      onLogin(key);
    } else {
      setError('Invalid key.');
    }
  }

  return (
    <div style={{ maxWidth: 320, margin: '80px auto', textAlign: 'left' }}>
      <h2 style={{ marginBottom: '24px' }}>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <Field label="Admin key">
          <input
            type="password"
            value={key}
            onChange={e => setKey(e.target.value)}
            style={fieldStyle}
            placeholder="Enter admin key"
          />
        </Field>
        {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}
        <button type="submit" style={btnStyle}>Log in</button>
      </form>
    </div>
  );
}

// ── Orders ───────────────────────────────────────────────────────────────────

function formatAddress(raw) {
  if (!raw) return '—';
  try {
    const a = JSON.parse(raw);
    return [a.address_line_1, a.address_line_2, a.admin_area_2, a.admin_area_1, a.postal_code, a.country_code]
      .filter(Boolean).join(', ');
  } catch {
    return raw;
  }
}

function Orders({ adminKey }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/orders`, { headers: { 'x-admin-key': adminKey } })
      .then(r => r.json())
      .then(setOrders);
  }, [adminKey]);

  return (
    <div style={sectionStyle}>
      <h2 style={{ marginBottom: '16px' }}>Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid black', textAlign: 'left' }}>
              <th style={{ padding: '6px 8px' }}>Date</th>
              <th style={{ padding: '6px 8px' }}>Release</th>
              <th style={{ padding: '6px 8px' }}>Type</th>
              <th style={{ padding: '6px 8px' }}>Amount</th>
              <th style={{ padding: '6px 8px' }}>Payer</th>
              <th style={{ padding: '6px 8px' }}>Email</th>
              <th style={{ padding: '6px 8px' }}>Shipping</th>
              <th style={{ padding: '6px 8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '6px 8px' }}>{o.created_at?.slice(0, 10)}</td>
                <td style={{ padding: '6px 8px' }}>{o.release_title ?? o.release_id}</td>
                <td style={{ padding: '6px 8px' }}>{o.purchase_type}</td>
                <td style={{ padding: '6px 8px' }}>${o.amount?.toFixed(2)}</td>
                <td style={{ padding: '6px 8px' }}>{o.payer_name || '—'}</td>
                <td style={{ padding: '6px 8px' }}>{o.payer_email || '—'}</td>
                <td style={{ padding: '6px 8px' }}>{formatAddress(o.shipping_address)}</td>
                <td style={{ padding: '6px 8px' }}>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Add Release ───────────────────────────────────────────────────────────────

function AddRelease({ adminKey }) {
  const empty = {
    title: '', artist: '', date: '', physprice: '', fileprice: '', stock: '0',
    side_a: '', side_b: '', notes: '', sample_urls: '', download_url: '', images: '',
  };
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState('');

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');
    const body = {
      title: form.title,
      artist: form.artist || undefined,
      date: form.date || undefined,
      physprice: parseFloat(form.physprice),
      fileprice: parseFloat(form.fileprice),
      stock: parseInt(form.stock, 10),
      notes: form.notes || undefined,
      side_a: form.side_a.split('\n').map(s => s.trim()).filter(Boolean),
      side_b: form.side_b.split('\n').map(s => s.trim()).filter(Boolean),
      sample_urls: form.sample_urls.split('\n').map(s => s.trim()).filter(Boolean),
      images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
      download_url: form.download_url || undefined,
    };
    const res = await fetch(`${API}/api/releases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setForm(empty);
      setStatus('Release added.');
    } else {
      const err = await res.json();
      setStatus(`Error: ${err.error}`);
    }
  }

  return (
    <div style={sectionStyle}>
      <h2 style={{ marginBottom: '16px' }}>Add Release</h2>
      <form onSubmit={handleSubmit}>
        <Field label="Title *">
          <input required style={fieldStyle} value={form.title} onChange={set('title')} placeholder='e.g. "Structured Water"' />
        </Field>
        <Field label="Artist">
          <input style={fieldStyle} value={form.artist} onChange={set('artist')} placeholder='e.g. "Unguent"' />
        </Field>
        <Field label="Date" hint="Short date label shown on the card">
          <input style={fieldStyle} value={form.date} onChange={set('date')} placeholder='e.g. "6.26"' />
        </Field>
        <Field label="Physical price *" hint="USD, e.g. 15.00">
          <input required type="number" min="0" step="0.01" style={fieldStyle} value={form.physprice} onChange={set('physprice')} placeholder="15.00" />
        </Field>
        <Field label="File price *" hint="USD, e.g. 6.00">
          <input required type="number" min="0" step="0.01" style={fieldStyle} value={form.fileprice} onChange={set('fileprice')} placeholder="6.00" />
        </Field>
        <Field label="Stock *" hint="Number of physical copies available">
          <input required type="number" min="0" step="1" style={fieldStyle} value={form.stock} onChange={set('stock')} placeholder="10" />
        </Field>
        <Field label="Side A tracks" hint="One track title per line">
          <textarea rows={4} style={fieldStyle} value={form.side_a} onChange={set('side_a')} placeholder={"Theory of Disinformation II\nRe-Equivalence"} />
        </Field>
        <Field label="Side B tracks" hint="One track title per line">
          <textarea rows={4} style={fieldStyle} value={form.side_b} onChange={set('side_b')} placeholder={"ZnCO₃ + TiO₂ + K₂O"} />
        </Field>
        <Field label="Sample URLs" hint="One audio file URL per line">
          <textarea rows={4} style={fieldStyle} value={form.sample_urls} onChange={set('sample_urls')} placeholder={"https://example.com/sample1.wav\nhttps://example.com/sample2.wav"} />
        </Field>
        <Field label="Notes" hint="Optional liner notes or description">
          <textarea rows={4} style={fieldStyle} value={form.notes} onChange={set('notes')} placeholder="Optional notes about the release..." />
        </Field>
        <Field label="Images" hint="One image URL per line">
          <textarea rows={3} style={fieldStyle} value={form.images} onChange={set('images')} placeholder={"https://example.com/cover.jpg\nhttps://example.com/back.jpg"} />
        </Field>
        <Field label="Download URL" hint="Single zip file URL for digital delivery">
          <input style={fieldStyle} value={form.download_url} onChange={set('download_url')} placeholder="https://example.com/release.zip" />
        </Field>
        {status && <p style={{ marginBottom: '12px', color: status.startsWith('Error') ? 'red' : 'green' }}>{status}</p>}
        <button type="submit" style={btnStyle}>Add Release</button>
      </form>
    </div>
  );
}

// ── Add Post ──────────────────────────────────────────────────────────────────

function AddPost({ adminKey }) {
  const empty = { title: '', body: '', image_urls: '', audio_urls: '' };
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState('');

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');
    const body = {
      title: form.title,
      body: form.body,
      image_urls: form.image_urls.split('\n').map(s => s.trim()).filter(Boolean),
      audio_urls: form.audio_urls.split('\n').map(s => s.trim()).filter(Boolean),
    };
    const res = await fetch(`${API}/api/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setForm(empty);
      setStatus('Post added.');
    } else {
      const err = await res.json();
      setStatus(`Error: ${err.error}`);
    }
  }

  return (
    <div style={sectionStyle}>
      <h2 style={{ marginBottom: '16px' }}>Add Blog Post</h2>
      <form onSubmit={handleSubmit}>
        <Field label="Title *">
          <input required style={fieldStyle} value={form.title} onChange={set('title')} placeholder='e.g. "New Release Announcement"' />
        </Field>
        <Field label="Body *" hint="Plain text; line breaks are preserved">
          <textarea required rows={8} style={fieldStyle} value={form.body} onChange={set('body')} placeholder="Write your post here..." />
        </Field>
        <Field label="Image URLs" hint="One image URL per line">
          <textarea rows={3} style={fieldStyle} value={form.image_urls} onChange={set('image_urls')} placeholder={"https://example.com/photo.jpg\nhttps://example.com/photo2.jpg"} />
        </Field>
        <Field label="Audio URLs" hint="One audio file URL per line">
          <textarea rows={3} style={fieldStyle} value={form.audio_urls} onChange={set('audio_urls')} placeholder={"https://example.com/track.wav\nhttps://example.com/track2.wav"} />
        </Field>
        {status && <p style={{ marginBottom: '12px', color: status.startsWith('Error') ? 'red' : 'green' }}>{status}</p>}
        <button type="submit" style={btnStyle}>Add Post</button>
      </form>
    </div>
  );
}

// ── Posts ─────────────────────────────────────────────────────────────────────

function Posts({ adminKey }) {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  function load() {
    fetch(`${API}/api/posts/all`, { headers: { 'x-admin-key': adminKey } })
      .then(r => r.json())
      .then(setPosts);
  }

  useEffect(() => { load(); }, [adminKey]);

  async function toggle(post) {
    const action = post.status === 'published' ? 'unpublish' : 'publish';
    await fetch(`${API}/api/posts/${post.id}/${action}`, {
      method: 'POST',
      headers: { 'x-admin-key': adminKey },
    });
    load();
  }

  return (
    <div style={sectionStyle}>
      <h2 style={{ marginBottom: '16px' }}>Posts</h2>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map(post => (
          <div key={post.id} style={{ borderBottom: '1px solid #ddd', padding: '12px 0', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 4px' }}>{post.title}</p>
              <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px' }}>{post.created_at?.slice(0, 10)}</p>
              <p style={{ fontSize: '13px', color: post.status === 'published' ? 'green' : '#aaa', margin: 0 }}>
                {post.status === 'published' ? 'Published' : 'Draft'}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => navigate(`/blog/preview/${post.id}`)} style={{ ...btnStyle, fontSize: '14px' }}>Preview</button>
              <button onClick={() => toggle(post)} style={{ ...btnStyle, fontSize: '14px', whiteSpace: 'nowrap' }}>
                {post.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Admin shell ───────────────────────────────────────────────────────────────

const tabs = ['Orders', 'Posts', 'Add Release', 'Add Post'];

export default function Admin() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem('adminKey') || '');
  const [tab, setTab] = useState('Orders');

  function logout() {
    localStorage.removeItem('adminKey');
    setAdminKey('');
  }

  if (!adminKey) return <Login onLogin={setAdminKey} />;

  return (
    <div style={{ padding: '32px 24px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                ...btnStyle,
                fontWeight: tab === t ? 'bold' : 'normal',
                background: 'none',
                border: 'none',
                borderBottom: tab === t ? '2px solid black' : '2px solid transparent',
                cursor: 'pointer',
                padding: '4px 0',
                marginRight: '16px',
                fontSize: '16px',
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <button onClick={logout} style={{ marginLeft: 'auto', fontSize: '14px', cursor: 'pointer' }}>Log out</button>
      </div>
      {tab === 'Orders' && <Orders adminKey={adminKey} />}
      {tab === 'Posts' && <Posts adminKey={adminKey} />}
      {tab === 'Add Release' && <AddRelease adminKey={adminKey} />}
      {tab === 'Add Post' && <AddPost adminKey={adminKey} />}
    </div>
  );
}
