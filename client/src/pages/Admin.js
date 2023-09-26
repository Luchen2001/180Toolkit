import React, {useState, useEffect} from 'react'
import { HeaderBar } from '../components/HeaderBar'
import api from '../utils/api';
import { Alert, Button, Snackbar } from "@mui/material";

export const Admin = () => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');

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
      
      console.log(response);
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
      setNotification("Updating market info, this would take around 2 minute");
    }
  };

  const getLastUpdate = async () => {
    try {
      const response = await api.get('/api/stocks//getLastUpdate');
      setLastUpdated(response.data.updatedAt);
    } catch (error) {
      console.error('Failed to fetch last update:', error.message || error);
    }
  };

  useEffect(() => {
    getLastUpdate();
  }, []);

  return (
    <div >
        <HeaderBar/>
        <div style={{padding: "24px", display: "flex", flexDirection: "row",
            alignItems: "center", gap: "12px" }}>
      <Button 
        color="primary" 
        variant="contained" 
        onClick={handleUpdateMarketInfo} 
        disabled={loading}
      >
        Update Market Info
      </Button>
      {lastUpdated && <Alert style={{ marginLeft: '10px' }}>Last Updated: {new Date(lastUpdated).toLocaleString()}</Alert>}
      <Snackbar 
        open={!!notification} 
        autoHideDuration={3000} 
        onClose={() => setNotification(null)}
        message={notification}
      />
    </div>
    </div>
  )
}
