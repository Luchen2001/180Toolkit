import React, { useState } from "react";
import { Button, CircularProgress, Snackbar } from "@mui/material";
import api from '../utils/api';

export const Setting = () => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleRestartDB = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/setting/restart_DB");
      console.log(response);
      // Handle the response as needed
      setNotification("Database restarted successfully!");
    } catch (error) {
      setNotification("An error occurred while restarting the database.");
    } finally {
      setLoading(false);
    }
  };
  const handleRestart4C = async () => {
    setLoading(true);
    try {
      const response = await api.post("/api/cashflow/update_cashflow");
      console.log(response);
      // Handle the response as needed
      setNotification("Database restarted successfully!");
    } catch (error) {
      setNotification("An error occurred while restarting the database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button 
        color="primary" 
        variant="contained" 
        onClick={handleRestartDB} 
        disabled={loading}
      >
        Restart Database
      </Button>
      <Button 
        color="primary" 
        variant="contained" 
        onClick={handleRestart4C} 
        disabled={loading}
      >
        Restart 4C Document
      </Button>
      {loading && <CircularProgress />} {/* Spinner while loading */}
      <Snackbar 
        open={!!notification} 
        autoHideDuration={6000} 
        onClose={() => setNotification(null)}
        message={notification}
      />
    </div>
  );
};
