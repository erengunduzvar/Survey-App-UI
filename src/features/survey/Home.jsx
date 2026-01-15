import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  Button,
  Container,
  IconButton,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
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
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600, cursor: "pointer" }}
            onClick={handleGoHome}
          >
            Survey App
          </Typography>
          <IconButton
            color="primary"
            onClick={handleCreateSurvey}
            sx={{ mr: 1 }}
            aria-label="Yeni Anket Oluştur"
          >
            <Add />
          </IconButton>
          <Button color="inherit" onClick={handleLogout}>
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
