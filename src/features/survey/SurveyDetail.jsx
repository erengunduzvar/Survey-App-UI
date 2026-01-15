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
  IconButton,
} from "@mui/material";
import { Add } from "@mui/icons-material";
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
      {content}
    </Box>
  );
}

export default SurveyDetail;
