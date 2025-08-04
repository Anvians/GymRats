import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { FaSearch, FaTimes } from 'react-icons/fa';
import "./index.css"; // New CSS file for the search panel

const SearchPanel = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Ref to the panel to detect outside clicks
  const panelRef = useRef(null);

  // Close panel on 'Escape' key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Debounced search effect
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    const delayDebounceFn = setTimeout(async () => {
  try {
    const token = Cookies.get("auth_token");
    console.log("Token for search:", token); // Log the token to verify it's being passed correctly
    // --- CHANGE THESE LINES ---
    const response = await axios.get(
      `http://localhost:5000/api/users/search?q=${searchTerm}`, // Use GET with a query parameter
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Search results:", response);
    // --- END OF CHANGES ---
    
    setResults(response.data.users || []);
    console.log(results)
  } catch (err) {
    setError("Failed to fetch users.");
    console.error("Search error:", err);
  } finally {
    setLoading(false);
  }
}, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div
      className={`search-panel-overlay ${isOpen ? 'open' : ''}`}
      onClick={onClose}
    >
      <aside
        ref={panelRef}
        className={`search-panel ${isOpen ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="search-panel-header">
          <h2>Search</h2>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </header>
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
        <div className="search-results">
          {loading && <div className="status-message">Loading...</div>}
          {error && <div className="status-message error">{error}</div>}
          {!loading && results.length === 0 && searchTerm.length > 0 && (
            <div className="status-message">No users found.</div>
          )}
          {results.map((user) => (
            <Link to={`/profile/${user.username}`} key={user._id} className="result-item" onClick={onClose}>
              <img src={user.dp || 'https://via.placeholder.com/50'} crossOrigin="anonymous" alt={user.username} className="result-dp" />
              <div className="result-info">
                <span className="result-username">{user.username}</span>
                <span className="result-name">{user.firstname} {user.lastname}</span>
              </div>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default SearchPanel;