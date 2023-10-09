import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import { useHistory } from "react-router-dom";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();
  if(!hasHiddenAuthButtons){
    const isLoggedIn = localStorage.getItem('token');
    const userName = localStorage.getItem('username');

    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        {children}
        <Stack direction="row" spacing={1} alignItems='center'>
          {isLoggedIn?
          <>
          <Avatar src='/avatar.png' alt={userName} />
          <p>{userName}</p>
          <Button
          onClick={()=>{
            localStorage.clear()
            window.location.reload()
          }}
        >
          Logout
        </Button>
          </>:
          <><Button
          onClick={()=>{
            history.push("/login")
          }}
        >
          Login
        </Button>
        <Button
          variant="contained"
          onClick={()=>{
            history.push("/register")
          }}
        >
          Register
        </Button></>}
        </Stack>
      </Box>
    );
  }
    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={()=>{
            history.push("/")
          }}
        >
          Back to explore
        </Button>
      </Box>
    );
};

export default Header;
