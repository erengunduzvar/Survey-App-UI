import { useNavigate, useLocation } from "react-router-dom";
import { AppBar, Box, Toolbar, Typography, Button } from "@mui/material";
import { Add, Logout as LogoutIcon } from "@mui/icons-material";

import { authService } from "../auth/authService";
import CreateSurvey from "./CreateSurvey";

function CreateSurveyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isCreatePage = location.pathname === "/surveys/new";

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
            disabled={isCreatePage}
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

      <CreateSurvey
        inline={false}
        redirectOnSuccess
        mode="create"
        onSuccess={() => navigate("/")}
      />
    </Box>
  );
}

export default CreateSurveyPage;
