import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL as API } from '../config.js';
import './Admin.css';

function Field({ label, hint, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {hint && <p className="meta-text">{hint}</p>}
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
    <div className="login">
      <h2 className="login-title">Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <Field label="Admin key">
          <input
            type="password"
            value={key}
            onChange={e => setKey(e.target.value)}
            className="field-input"
            placeholder="Enter admin key"
          />
        </Field>
        {error && <p className="field-error">{error}</p>}
        <button type="submit" className="btn">Log in</button>
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
    <div className="orders-section">
      <h2 className="section-heading">Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="table-scroll">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Release</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Payer</th>
                <th>Email</th>
                <th>Shipping</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>{o.created_at?.slice(0, 10)}</td>
                  <td>{o.release_title ?? o.release_id}</td>
                  <td>{o.purchase_type}</td>
                  <td>${o.amount?.toFixed(2)}</td>
                  <td>{o.payer_name || '—'}</td>
                  <td>{o.payer_email || '—'}</td>
                  <td>{formatAddress(o.shipping_address)}</td>
                  <td>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    <div className="admin-section">
      <h2 className="section-heading">Add Release</h2>
      <form onSubmit={handleSubmit}>
        <Field label="Title *">
          <input required className="field-input" value={form.title} onChange={set('title')} placeholder='e.g. "Structured Water"' />
        </Field>
        <Field label="Artist">
          <input className="field-input" value={form.artist} onChange={set('artist')} placeholder='e.g. "Unguent"' />
        </Field>
        <Field label="Date" hint="Short date label shown on the card">
          <input className="field-input" value={form.date} onChange={set('date')} placeholder='e.g. "6.26"' />
        </Field>
        <Field label="Physical price *" hint="USD, e.g. 15.00">
          <input required type="number" min="0" step="0.01" className="field-input" value={form.physprice} onChange={set('physprice')} placeholder="15.00" />
        </Field>
        <Field label="File price *" hint="USD, e.g. 6.00">
          <input required type="number" min="0" step="0.01" className="field-input" value={form.fileprice} onChange={set('fileprice')} placeholder="6.00" />
        </Field>
        <Field label="Stock *" hint="Number of physical copies available">
          <input required type="number" min="0" step="1" className="field-input" value={form.stock} onChange={set('stock')} placeholder="10" />
        </Field>
        <Field label="Side A tracks" hint="One track title per line">
          <textarea rows={4} className="field-input" value={form.side_a} onChange={set('side_a')} placeholder={"Theory of Disinformation II\nRe-Equivalence"} />
        </Field>
        <Field label="Side B tracks" hint="One track title per line">
          <textarea rows={4} className="field-input" value={form.side_b} onChange={set('side_b')} placeholder={"ZnCO₃ + TiO₂ + K₂O"} />
        </Field>
        <Field label="Sample URLs" hint="One audio file URL per line">
          <textarea rows={4} className="field-input" value={form.sample_urls} onChange={set('sample_urls')} placeholder={"https://example.com/sample1.wav\nhttps://example.com/sample2.wav"} />
        </Field>
        <Field label="Notes" hint="Optional liner notes or description">
          <textarea rows={4} className="field-input" value={form.notes} onChange={set('notes')} placeholder="Optional notes about the release..." />
        </Field>
        <Field label="Images" hint="One image URL per line">
          <textarea rows={3} className="field-input" value={form.images} onChange={set('images')} placeholder={"https://example.com/cover.jpg\nhttps://example.com/back.jpg"} />
        </Field>
        <Field label="Download file" hint="Filename of the zip in your R2 bucket">
          <input className="field-input" value={form.download_url} onChange={set('download_url')} placeholder="Release-Name.zip" />
        </Field>
        {status && <p className={`status-msg ${status.startsWith('Error') ? 'error' : 'success'}`}>{status}</p>}
        <button type="submit" className="btn">Add Release</button>
      </form>
    </div>
  );
}

// ── Edit Release ──────────────────────────────────────────────────────────────

function EditRelease({ release, adminKey, onCancel, onSaved }) {
  const [form, setForm] = useState({
    title: release.title || '',
    artist: release.artist || '',
    date: release.date || '',
    physprice: String(release.physprice ?? ''),
    fileprice: String(release.fileprice ?? ''),
    stock: String(release.stock ?? '0'),
    side_a: (release.side_a || []).join('\n'),
    side_b: (release.side_b || []).join('\n'),
    notes: release.notes || '',
    sample_urls: (release.sample_urls || []).join('\n'),
    download_url: release.download_url || '',
    images: (release.images || []).join('\n'),
  });
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
    const res = await fetch(`${API}/api/releases/${release.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      onSaved();
    } else {
      const err = await res.json();
      setStatus(`Error: ${err.error}`);
    }
  }

  return (
    <div className="admin-section">
      <h2 className="section-heading">Edit Release</h2>
      <form onSubmit={handleSubmit}>
        <Field label="Title *">
          <input required className="field-input" value={form.title} onChange={set('title')} />
        </Field>
        <Field label="Artist">
          <input className="field-input" value={form.artist} onChange={set('artist')} />
        </Field>
        <Field label="Date" hint="Short date label shown on the card">
          <input className="field-input" value={form.date} onChange={set('date')} />
        </Field>
        <Field label="Physical price *" hint="USD, e.g. 15.00">
          <input required type="number" min="0" step="0.01" className="field-input" value={form.physprice} onChange={set('physprice')} />
        </Field>
        <Field label="File price *" hint="USD, e.g. 6.00">
          <input required type="number" min="0" step="0.01" className="field-input" value={form.fileprice} onChange={set('fileprice')} />
        </Field>
        <Field label="Stock *" hint="Number of physical copies available">
          <input required type="number" min="0" step="1" className="field-input" value={form.stock} onChange={set('stock')} />
        </Field>
        <Field label="Side A tracks" hint="One track title per line">
          <textarea rows={4} className="field-input" value={form.side_a} onChange={set('side_a')} />
        </Field>
        <Field label="Side B tracks" hint="One track title per line">
          <textarea rows={4} className="field-input" value={form.side_b} onChange={set('side_b')} />
        </Field>
        <Field label="Sample URLs" hint="One audio file URL per line">
          <textarea rows={4} className="field-input" value={form.sample_urls} onChange={set('sample_urls')} />
        </Field>
        <Field label="Notes" hint="Optional liner notes or description">
          <textarea rows={4} className="field-input" value={form.notes} onChange={set('notes')} />
        </Field>
        <Field label="Images" hint="One image URL per line">
          <textarea rows={3} className="field-input" value={form.images} onChange={set('images')} />
        </Field>
        <Field label="Download file" hint="Filename of the zip in your R2 bucket">
          <input className="field-input" value={form.download_url} onChange={set('download_url')} />
        </Field>
        {status && <p className="status-msg error">{status}</p>}
        <div className="post-actions">
          <button type="submit" className="btn">Save Changes</button>
          <button type="button" onClick={onCancel} className="btn btn-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ── Releases ──────────────────────────────────────────────────────────────────

function Releases({ adminKey }) {
  const [releases, setReleases] = useState([]);
  const [editingId, setEditingId] = useState(null);

  function load() {
    fetch(`${API}/api/releases`)
      .then(r => r.json())
      .then(setReleases);
  }

  useEffect(() => { load(); }, []);

  const editingRelease = releases.find(r => r.id === editingId);
  if (editingRelease) {
    return (
      <EditRelease
        release={editingRelease}
        adminKey={adminKey}
        onCancel={() => setEditingId(null)}
        onSaved={() => { setEditingId(null); load(); }}
      />
    );
  }

  return (
    <div className="admin-section">
      <h2 className="section-heading">Releases</h2>
      {releases.length === 0 ? (
        <p>No releases yet.</p>
      ) : (
        releases.map(release => (
          <div key={release.id} className="post-row">
            <div className="post-info">
              <p className="post-title">{release.title}</p>
              <p className="meta-text">{release.artist || '—'} · {release.date || '—'} · Stock: {release.stock}</p>
            </div>
            <div className="post-actions">
              <button onClick={() => setEditingId(release.id)} className="btn btn-sm">Edit</button>
            </div>
          </div>
        ))
      )}
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
    <div className="admin-section">
      <h2 className="section-heading">Add Blog Post</h2>
      <form onSubmit={handleSubmit}>
        <Field label="Title *">
          <input required className="field-input" value={form.title} onChange={set('title')} placeholder='e.g. "New Release Announcement"' />
        </Field>
        <Field label="Body *" hint="Plain text; line breaks are preserved. Use [text](url) to add a link.">
          <textarea required rows={8} className="field-input" value={form.body} onChange={set('body')} placeholder="Write your post here..." />
        </Field>
        <Field label="Image URLs" hint="One image URL per line">
          <textarea rows={3} className="field-input" value={form.image_urls} onChange={set('image_urls')} placeholder={"https://example.com/photo.jpg\nhttps://example.com/photo2.jpg"} />
        </Field>
        <Field label="Audio URLs" hint="One audio file URL per line">
          <textarea rows={3} className="field-input" value={form.audio_urls} onChange={set('audio_urls')} placeholder={"https://example.com/track.wav\nhttps://example.com/track2.wav"} />
        </Field>
        {status && <p className={`status-msg ${status.startsWith('Error') ? 'error' : 'success'}`}>{status}</p>}
        <button type="submit" className="btn">Add Post</button>
      </form>
    </div>
  );
}

// ── Edit Post ─────────────────────────────────────────────────────────────────

function EditPost({ post, adminKey, onCancel, onSaved }) {
  const [form, setForm] = useState({
    title: post.title,
    body: post.body,
    image_urls: post.image_urls.join('\n'),
    audio_urls: post.audio_urls.join('\n'),
  });
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
    const res = await fetch(`${API}/api/posts/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      onSaved();
    } else {
      const err = await res.json();
      setStatus(`Error: ${err.error}`);
    }
  }

  return (
    <div className="admin-section">
      <h2 className="section-heading">Edit Post</h2>
      <form onSubmit={handleSubmit}>
        <Field label="Title *">
          <input required className="field-input" value={form.title} onChange={set('title')} />
        </Field>
        <Field label="Body *" hint="Plain text; line breaks are preserved. Use [text](url) to add a link.">
          <textarea required rows={8} className="field-input" value={form.body} onChange={set('body')} />
        </Field>
        <Field label="Image URLs" hint="One image URL per line">
          <textarea rows={3} className="field-input" value={form.image_urls} onChange={set('image_urls')} />
        </Field>
        <Field label="Audio URLs" hint="One audio file URL per line">
          <textarea rows={3} className="field-input" value={form.audio_urls} onChange={set('audio_urls')} />
        </Field>
        {status && <p className="status-msg error">{status}</p>}
        <div className="post-actions">
          <button type="submit" className="btn">Save Changes</button>
          <button type="button" onClick={onCancel} className="btn btn-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ── Posts ─────────────────────────────────────────────────────────────────────

function Posts({ adminKey }) {
  const [posts, setPosts] = useState([]);
  const [editingId, setEditingId] = useState(null);
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

  const editingPost = posts.find(p => p.id === editingId);
  if (editingPost) {
    return (
      <EditPost
        post={editingPost}
        adminKey={adminKey}
        onCancel={() => setEditingId(null)}
        onSaved={() => { setEditingId(null); load(); }}
      />
    );
  }

  return (
    <div className="admin-section">
      <h2 className="section-heading">Posts</h2>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map(post => (
          <div key={post.id} className="post-row">
            <div className="post-info">
              <p className="post-title">{post.title}</p>
              <p className="meta-text">{post.created_at?.slice(0, 10)}</p>
              <p className={`post-status ${post.status === 'published' ? 'published' : 'draft'}`}>
                {post.status === 'published' ? 'Published' : 'Draft'}
              </p>
            </div>
            <div className="post-actions">
              <button onClick={() => navigate(`/blog/preview/${post.id}`)} className="btn btn-sm">Preview</button>
              <button onClick={() => setEditingId(post.id)} className="btn btn-sm">Edit</button>
              <button onClick={() => toggle(post)} className="btn btn-sm">
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

const tabs = ['Orders', 'Releases', 'Posts', 'Add Release', 'Add Post'];

export default function Admin() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem('adminKey') || '');
  const [tab, setTab] = useState('Orders');

  function logout() {
    localStorage.removeItem('adminKey');
    setAdminKey('');
  }

  if (!adminKey) return <Login onLogin={setAdminKey} />;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-tabs">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`tab-btn ${tab === t ? 'active' : ''}`}
            >
              {t}
            </button>
          ))}
        </div>
        <button onClick={logout} className="admin-logout">Log out</button>
      </div>
      {tab === 'Orders' && <Orders adminKey={adminKey} />}
      {tab === 'Releases' && <Releases adminKey={adminKey} />}
      {tab === 'Posts' && <Posts adminKey={adminKey} />}
      {tab === 'Add Release' && <AddRelease adminKey={adminKey} />}
      {tab === 'Add Post' && <AddPost adminKey={adminKey} />}
    </div>
  );
}
