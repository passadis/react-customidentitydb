import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // You will create a corresponding CSS file for this component

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [photo, setPhoto] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const photoInputRef = useRef(null);

  const handleRegistration = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Reset error message
    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('department', department);
    formData.append('position', position);
    
    

    if (photoInputRef.current && photoInputRef.current.files[0]) {
      formData.append('photo', photoInputRef.current.files[0]);
    }

    /*const requestData = {
      formData: formData,
      password: password // Send password as a separate field
    };*/

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/'); // Replace with your login route
      // Handle successful registration here
      console.log(response.data);
      // Optionally redirect to login or another page
    } catch (error) {
      console.error("Error registering:", error.response);
      setErrorMessage(error.response.data.message || 'Error registering.');
      // Handle errors here
    }
  };

  const handlePhotoChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setPhoto(URL.createObjectURL(event.target.files[0]));
    }
  };

  return (
    <div className="Register">
      <h1>Sign Up</h1>
      <form onSubmit={handleRegistration}>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
        <input
          type="text"
          placeholder="Position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />                                
        {/* Repeat for other inputs */}
        <input
          type="file"
          ref={photoInputRef} // Add the ref to the file input
          onChange={handlePhotoChange}
        />
        <div className="photo-preview">
          {photo && <img src={photo} alt="Preview" />}
        </div>
        <button type="submit">Register Account</button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

export default Register;
