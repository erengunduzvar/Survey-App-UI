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
import SurveyList from "./SurveyList";

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleCreateSurvey = () => {
    navigate("/surveys/new");
  };

  const handleGoHome = () => {
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
    </Box>
  );
}

export default Home;
