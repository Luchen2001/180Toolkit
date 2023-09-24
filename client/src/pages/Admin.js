import React, {useState} from 'react'
import { HeaderBar } from '../components/HeaderBar'
import api from '../utils/api';
import { Button, Snackbar } from "@mui/material";

export const Admin = () => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const updateMarketInfoFromAPI = async () => {
    try {
      const response = await api.get('/api/admin/updateMarketInfo');
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to update market info:', error.message || error);
      throw error;
    }
  };

  const handleUpdateMarketInfo = async () => {
    setLoading(true);
    try {
      const response = await updateMarketInfoFromAPI();
      setNotification(response.message || "Successfully updated market info.");
    } catch (error) {
      setNotification("Failed to update market info.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
        <HeaderBar/>
        <div>
      <Button 
        color="primary" 
        variant="contained" 
        onClick={handleUpdateMarketInfo} 
        disabled={loading}
      >
        Update Market Info
      </Button>
      <Snackbar 
        open={!!notification} 
        autoHideDuration={6000} 
        onClose={() => setNotification(null)}
        message={notification}
      />
    </div>
    </div>
  )
}
