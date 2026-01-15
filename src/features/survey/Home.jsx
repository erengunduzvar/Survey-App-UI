import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  Button,
  Container,
  Typography,
} from "@mui/material";
import { Add, Logout as LogoutIcon } from "@mui/icons-material";
import { authService } from "../auth/authService";
import CreateSurvey from "./CreateSurvey";
import SurveyList from "./SurveyList";

function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function Home() {
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  let userEmail = "";
  try {
    const token = authService.getToken();
    if (token) {
      const payload = decodeJwt(token);
      if (!payload) {
        throw new Error("Invalid token payload");
      }
      userEmail = payload.email || "";
    }
  } catch {}

  const handleCreateSurvey = () => {
    setShowCreate((prev) => !prev);
  };

  const handleGoHome = () => {
    setShowCreate(false);
    navigate("/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ minHeight: 72 }}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 800,
              cursor: "pointer",
              fontSize: 24,
            }}
            onClick={handleGoHome}
          >
            Survey App
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleCreateSurvey}
            sx={{
              mr: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              px: 2.25,
              py: 1.1,
            }}
            size="large"
          >
            Yeni Anket Oluştur
          </Button>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ textTransform: "none", fontWeight: 700 }}
            size="large"
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      {!showCreate && (
        <Box
          sx={{
            flex: 1,
            py: 4,
          }}
        >
          <Container maxWidth="lg">
            <SurveyList />
          </Container>
        </Box>
      )}
      {showCreate && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            py: "4px",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 1200, px: "4px" }}>
            <CreateSurvey
              inline
              redirectOnSuccess={false}
              onSuccess={() => setShowCreate(false)}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Home;
