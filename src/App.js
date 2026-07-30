import './App.css';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Releaselist from './components/Releaselist.js';
import Blog from './components/Blog.js';
import Admin from './components/Admin.js';
import BlogPreview from './components/BlogPreview.js';
import Info from './components/Info.js';
import { PAYPAL_CLIENT_ID } from './config.js';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <div>
            <h1>¯\_(ツ)_/¯</h1>
          </div>
          <div className="App-tagline">
            <p className="App-tagline-primary">Shrug is a private press</p>
            <p className="App-tagline-primary">for the Holocene Epoch</p>
            <p className="App-tagline-secondary">¯\_(ツ)_/¯¯\_(ツ)_/¯¯\_(ツ)_/¯</p>
          </div>
          <nav className="App-nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}>Press</NavLink>
            <NavLink to="/blog" className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}>Blog</NavLink>
            <NavLink to="/info" className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}>Info</NavLink>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={
            <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
              <Releaselist className="release-list" />
            </PayPalScriptProvider>
          } />
          <Route path="/blog" element={<Blog />} />
          <Route path="/info" element={<Info />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/blog/preview/:id" element={<BlogPreview />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
