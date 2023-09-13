import React, { useState } from 'react';
import api from '../utils/api';
import { Container, TextField, Button, Typography, Paper, Box } from '@mui/material';
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const navigate = useNavigate()

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await api.post("/login", { username, password });
      const token = response.data.token;
      // Save token to localStorage
      localStorage.setItem('token', token);
      navigate('/home')
    } catch (err) {
      setError("Username or password is not correct");
    }
  };

  return (
    <Container component={Paper} maxWidth="xs" elevation={3} sx={{ p: 3, mt: 10 }}>
      <Typography variant="h5" align="center" mb={3}>
        Login
      </Typography>
      <TextField
        fullWidth
        label="Username"
        variant="outlined"
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        variant="outlined"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <Typography color="error">{error}</Typography>}
      <Box mt={2}>
        <Button
          fullWidth
          color="primary"
          variant="contained"
          onClick={handleLogin}
        >
          Login
        </Button>
      </Box>
    </Container>
  );
};
