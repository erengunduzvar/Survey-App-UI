import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { Add, Logout as LogoutIcon } from "@mui/icons-material";
import { authService } from "../auth/authService";
import CreateSurvey from "./CreateSurvey";

function SurveyDetail() {
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleCreateSurvey = () => {
    navigate("/surveys/new");
  };

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await authService.fetchWithAuth(
          `/api/surveys/${surveyId}`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error("Anket detayı alınırken hata oluştu");
        }

        const data = await response.json();
        setSurvey(data);
      } catch (err) {
        setError(err.message || "Anket detayı alınırken hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    if (surveyId) {
      fetchDetail();
    }
  }, [surveyId]);
  let content = null;

  if (loading) {
    content = (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  } else if (error) {
    content = (
      <Box sx={{ maxWidth: 960, mx: "auto", mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  } else if (survey) {
    content = (
      <CreateSurvey
        inline={false}
        redirectOnSuccess
        mode="edit"
        surveyId={surveyId}
        initialSurvey={survey}
        onSuccess={() => navigate("/")}
      />
    );
  }

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
      {content}
    </Box>
  );
}

export default SurveyDetail;
