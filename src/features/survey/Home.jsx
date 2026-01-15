import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Card,
  Fab,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { authService } from "../auth/authService";
import CreateSurvey from "./CreateSurvey";

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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor:
          "linear-gradient(135deg, #edf2ff 0%, #f8f9ff 50%, #ffffff 100%)",
      }}
    >
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            Survey App
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 6,
        }}
      >
        <Container maxWidth="sm">
          <Card
            elevation={6}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 4,
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Hoş geldin{userEmail ? `, ${userEmail}` : ""}!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Modern, kullanıcı dostu anketlerini kolayca oluşturup paylaşmaya
              hazırsın.
            </Typography>
          </Card>
        </Container>
      </Box>
      {showCreate && (
        <Box sx={{ display: "flex", justifyContent: "center", pb: 6 }}>
          <Box sx={{ width: "100%", maxWidth: 960, px: 2 }}>
            <CreateSurvey
              inline
              redirectOnSuccess={false}
              onSuccess={() => setShowCreate(false)}
            />
          </Box>
        </Box>
      )}
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
        }}
        aria-label="Yeni Anket Oluştur"
        onClick={handleCreateSurvey}
      >
        <Add />
      </Fab>
    </Box>
  );
}

export default Home;
