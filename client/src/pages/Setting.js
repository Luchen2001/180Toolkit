import React, { useState } from "react";
import {
  Button,
  CircularProgress,
  Snackbar,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import PublishIcon from "@mui/icons-material/Publish"; // Import the publish icon
import InfoIcon from "@mui/icons-material/Info";
import api from "../utils/api";

export const Setting = () => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [jsonFile, setJsonFile] = useState(null); // state to keep track of the selected file

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
        const response = await api.post(
          "/api/setting/updateIndustry",
          jsonData
        );
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
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setNotification("Database restarted successfully!");
    }
  };
  const handleRestart4C = async () => {
    setLoading(true);
    try {
      const response = await api.post("/api/cashflow/update_cashflow");
      console.log(response);
      // Handle the response as needed
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setNotification(
        "4C Documents are being generating, this may take a while!"
      );
    }
  };

  return (
    <div style={{ padding: "12px" }}>
      <div
        style={{
          padding: "12px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <Button
          color="primary"
          variant="contained"
          onClick={handleRestart4C}
          disabled={loading}
        >
          Restart 4C Document
        </Button>
        <Tooltip title="It will automatically rewrite all the cashflow to the latest version by fetching and reading all 4C documents">
          <InfoIcon color="action" />
        </Tooltip>
      </div>
      <div
        style={{
          padding: "12px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <Button
          color="error"
          variant="contained"
          onClick={handleRestartDB}
          disabled={loading}
        >
          Restart Database
        </Button>
        <TextField
          variant="outlined"
          type="file"
          size="small"
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
    </div>
  );
};
