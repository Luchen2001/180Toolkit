import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  IconButton,
  List,
  ListItem,
  Button,
  Typography,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import PollIcon from "@mui/icons-material/Poll";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import api from "../utils/api";

export const HeaderBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [privilegeCode, setPrivilegeCode] = useState("");

  const handleLogout = () => {
    // Delete the token
    localStorage.removeItem("token");

    // Navigate to the login page
    navigate("/login");
  };

  const handleAvatarClick = () => {
    setIsDialogOpen(true);
  };

  const handlePrivilegeCodeSubmit = async () => {
    // Call the API to check the code or compare with hardcoded value
    const response = await api.post("/api/setting/auth", { privilegeCode });
    const isValidCode = response.data.isValidCode;

    if (isValidCode) {
      navigate("/setting"); // Assuming "/privilege-setting" is the route to the privilege setting page
    } else {
      alert("Invalid code"); // Provide user feedback if necessary
    }

    setIsDialogOpen(false); // Close the dialog
  };

  const getPageName = () => {
    console.log(location.pathname);
    switch (location.pathname) {
      case "/home":
        return "Home";
      case "/cash":
        return "Cash";
      case "/placement":
        return "Placement";
      case "/stock":
        return "Stock";
      case "/admin":
        return "Admin";
      default:
        return "";
    }
  };

  const drawerList = (
    <List
      sx={{
        pt: 2,
        pl: 2,
        pb: 40,
        height: "300px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <ListItem onClick={() => setIsDrawerOpen(false)}>
        <Button
          variant="text"
          startIcon={<HomeIcon />}
          onClick={() => navigate("/home")}
        >
          Home
        </Button>
      </ListItem>
      <ListItem onClick={() => setIsDrawerOpen(false)}>
        <Button
          variant="text"
          startIcon={<RequestQuoteIcon />}
          onClick={() => navigate("/cash")}
        >
          Cash
        </Button>
      </ListItem>
      <ListItem onClick={() => setIsDrawerOpen(false)}>
        <Button
          variant="text"
          startIcon={<PollIcon />}
          onClick={() => navigate("/placement")}
        >
          Placement
        </Button>
      </ListItem>
      <ListItem onClick={() => setIsDrawerOpen(false)}>
        <Button
          variant="text"
          color="secondary"
          startIcon={<ShowChartIcon />}
          onClick={() => navigate("/stock")}
        >
          Stock
        </Button>
      </ListItem>
      <ListItem onClick={() => setIsDrawerOpen(false)}>
        <Button
          variant="text"
          startIcon={<AdminPanelSettingsIcon />}
          onClick={() => navigate("/admin")}
        >
          Admin
        </Button>
      </ListItem>
    </List>
  );

  return (
    <Box sx={{ height: 60 }}>
      <AppBar sx={{ background: "#FFFFFF" }}>
        <Toolbar style={{ display: "flex" }}>
          {/* Group 1 - Button & Logo (aligned left) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              flex: 1,
            }}
          >
            <IconButton
              size="large"
              edge="start"
              onClick={() => setIsDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <img
              src={require("../assets/180logo.png")}
              alt="logo"
              style={{ width: "auto", height: "30px" }}
            />
          </div>

          {/* Group 2 - Page Name (centered) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <Typography variant="h4" color="primary">
              {getPageName()}
            </Typography>
          </div>

          {/* Group 3 - Avatar (aligned right) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              flex: 1,
            }}
          >
            <Avatar onClick={handleAvatarClick}></Avatar>
          </div>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "10px",
          }}
        >
          <img
            src={require("../assets/180logo_sm.png")}
            alt="logo small"
            style={{ width: "50px", height: "50px" }}
          />
        </div>
        {drawerList}
        <Button
          variant="contained"
          color="error"
          size="small"
          sx={{ m: 4 }}
          onClick={handleLogout}
        >
          Log Out
        </Button>
      </Drawer>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Enter Privilege Code</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Privilege Code"
            type="text"
            fullWidth
            value={privilegeCode}
            onChange={(e) => setPrivilegeCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handlePrivilegeCodeSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
