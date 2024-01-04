import React, { useState, useEffect, useRef  } from 'react';
import axios from 'axios';
import logo from '../logo.png';
import './Dashboard.css'; 
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const mapRef = useRef(null); // Ref for the map container
  const azureMapsKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // Replace with your Azure Maps key
  
  useEffect(() => {
	  const backendUrl = process.env.REACT_APP_BACKEND_URL 
      const fetchUserData = async () => {
      const UserId = localStorage.getItem('UserId');
      if (UserId) {
        try {
          const response = await axios.get(`${backendUrl}/user/${UserId}`, {
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
   
    // Initialize Azure Maps
    useEffect(() => {
      if (window.atlas && mapRef.current) {
        const map = new window.atlas.Map(mapRef.current, {
          center: [-122.33, 47.6], // You can change this to a default location
          zoom: 12,
          authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: azureMapsKey
          }
        });
      }
    }, [azureMapsKey]);


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('UserId');
    navigate('/'); // Redirect to login page after logout
  };
  
  // Function to handle address search
  const handleSearch = async () => {
    if (!searchTerm) return; // If the search term is empty, do nothing

    try {
      const searchResponse = await axios.get(`https://atlas.microsoft.com/search/address/json`, {
        params: {
          'api-version': '1.0',
          'subscription-key': azureMapsKey,
          'query': searchTerm
        }
      });

      if (searchResponse.data.results && searchResponse.data.results.length > 0) {
        const firstResult = searchResponse.data.results[0];
        const position = new window.atlas.data.Position(firstResult.position.lon, firstResult.position.lat);

        if (mapRef.current && mapRef.current.map) {
          const map = mapRef.current.map;
          map.setCamera({ center: position, zoom: 15 });
          
          // Optionally add a marker for the searched location
          const pin = new window.atlas.HtmlMarker({
            position: position,
            color: 'DodgerBlue',
            text: 'S'
          });
          map.markers.add(pin);
        }
      }
    } catch (error) {
      console.error('Error during address search:', error);
    }
  };


  if (!user) {
    return <div>Loading user data...</div>;
  }

  // URL for a default or placeholder image
  const defaultPhotoUrl = './src/logo.png'; // Replace with the path to your default or placeholder image

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="user-info">
          {/* Notice the change from user.photoUrl to user.PhotoUrl */}
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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">Search</button>
      </div>
      <div ref={mapRef} className="map-container"></div>
    </div>
  );
};

export default Dashboard;
