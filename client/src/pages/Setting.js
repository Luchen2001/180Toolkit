import React, { useState } from "react";
import { Button, CircularProgress, Snackbar, TextField, InputAdornment, IconButton } from "@mui/material";
import PublishIcon from '@mui/icons-material/Publish';  // Import the publish icon
import api from '../utils/api';

export const Setting = () => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);  // state to keep track of the selected file

  const handleFileChange = (event) => {
    setJsonFile(event.target.files[0]);
  };

  const handleUploadJSON = async () => {
    if (!jsonFile) return setNotification("No file selected.");

    // Read the file
    const reader = new FileReader();
    reader.onload = async (fileLoadedEvent) => {
      try {
        const jsonData = JSON.parse(fileLoadedEvent.target.result);
        console.log(jsonData); // Log the parsed data
        
        setLoading(true);

        // Send the JSON data to the server
        const response = await api.post("/api/setting/updateIndustry", jsonData);
        console.log(response);
        setNotification("JSON uploaded successfully!");
        
      } catch (error) {
        setNotification("An error occurred while uploading the JSON.");
      } finally {
        setLoading(false);
      }
    };
    
    // Trigger the reading of the file. Once done, the onload function will be called
    reader.readAsText(jsonFile);
  };

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
      <TextField
        variant="outlined"
        type="file"
        fullWidth
        onChange={handleFileChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton onClick={handleUploadJSON}>
                <PublishIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
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
