import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../logo.png';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(''); // State to store AI response
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const UserId = localStorage.getItem('UserId');
      if (UserId) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/${UserId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
          navigate('/');
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('UserId');
    navigate('/');
  };

  const handleQuery = async () => {
    if (!query) return;
  
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/openai-query`, { query });
  
      // Extracting the 'content' from the 'aiResponse' object
      const responseContent = response.data.aiResponse.content;
  
      // Set the AI response or a default message if the response content is not available
      setAiResponse(responseContent || 'I am sorry, I cannot answer that.');
    } catch (error) {
      console.error('Error during query processing:', error);
      setAiResponse('An error occurred while processing your request.');
    }
  };

  if (!user) {
    return <div>Loading user data...</div>;
  }

  const defaultPhotoUrl = './src/logo.png';

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="user-info">
          <img src={user.PhotoUrl || defaultPhotoUrl} alt="User" className="user-photo" />
          <div className="user-details">
            <div className="user-name">{user.FirstName} {user.LastName}</div>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </div>
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <div className="search-area">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask..."
          className="search-input"
        />
        <button onClick={handleQuery} className="search-button">Ask</button>
      </div>
      {/* Display AI Response */}
      <div className="ai-response">
        {aiResponse}
        </div>
    </div>
  );
};

export default Dashboard;
