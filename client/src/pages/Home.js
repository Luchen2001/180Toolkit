import React, {useState} from 'react'
import { HeaderBar } from '../components/HeaderBar'
import { TextField, Button, Typography, Paper, Box, Snackbar, Alert } from '@mui/material';
import api from '../utils/api';

export const Home = () => {
  const [code, setCode] = useState('');
    const [vwap, setVwap] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState('');

    const fetchVWAP = async () => {
        try {
            const response = await api.get(`/api/stocks/vwap/${code}`);
            setVwap(response.data);
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Failed to fetch VWAP. Please try again.');
        setSnackbarOpen(true);
        }
    };

  return (
    <div>
        <HeaderBar/>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 4 }}>
            <Paper elevation={3} sx={{ padding: 3, width: '300px' }}>
                <Typography variant="h6" gutterBottom>
                    VWAP Calculator
                </Typography>
                <TextField
                    label="Company Code"
                    variant="outlined"
                    fullWidth
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                <Box sx={{ marginTop: 2 }}>
                    <Button variant="contained" color="primary" onClick={fetchVWAP}>
                        Calculate VWAP
                    </Button>
                </Box>
                {vwap.vwap5 && (
                    <Box sx={{ marginTop: 2 }}>
                        <Typography variant="body1"><strong>5-day VWAP:</strong> {vwap.vwap5.toFixed(5)}</Typography>
                        <Typography variant="body1"><strong>15-day VWAP:</strong> {vwap.vwap15.toFixed(5)}</Typography>
                        <Typography variant="body1"><strong>30-day VWAP:</strong> {vwap.vwap30.toFixed(5)}</Typography>
                    </Box>
                )}
            </Paper>
        </Box>
        <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
            {snackbarMessage}
        </Alert>
    </Snackbar>
    </div>
  )
}
