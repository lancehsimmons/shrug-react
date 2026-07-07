import './App.css';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Releaselist from './components/Releaselist.js';
import Blog from './components/Blog.js';
import Admin from './components/Admin.js';
import BlogPreview from './components/BlogPreview.js';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <div>
            <h1>¯\_(ツ)_/¯</h1>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginLeft: "8px" }}>
            <p style={{ fontSize: "18px" }}>Shrug is a private press</p>
            <p style={{ fontSize: "18px" }}>for the Holocene Epoch</p>
            <p style={{ fontSize: "14px" }}>¯\_(ツ)_/¯¯\_(ツ)_/¯¯\_(ツ)_/¯</p>
          </div>
          <nav className="App-nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}>Press</NavLink>
            <NavLink to="/blog" className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}>Blog</NavLink>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={
            <PayPalScriptProvider options={{ clientId: "AQZjArrSxsgLKxn-k4s3a927C2xkdsGDVDzmnicKuj-xlEdolFLqQwkjwEJ1cnvzOg28RwBM9Xkp-ZNi" }}>
              <Releaselist className="release-list" />
            </PayPalScriptProvider>
          } />
          <Route path="/blog" element={<Blog />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/blog/preview/:id" element={<BlogPreview />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
