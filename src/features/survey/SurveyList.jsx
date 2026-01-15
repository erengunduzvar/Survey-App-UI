import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Edit, Delete, ContentCopy, Visibility } from "@mui/icons-material";
import { authService } from "../auth/authService";

function SurveyList() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("tr-TR", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (status) => {
    if (!status) return "-";
    const normalized = String(status).toUpperCase();
    if (normalized === "PUBLISHED") return "Yayında";
    if (normalized === "DRAFT") return "Taslak";
    return status;
  };

  useEffect(() => {
    const fetchSurveys = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await authService.fetchWithAuth("/api/surveys", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Anketler alınırken hata oluştu");
        }

        const data = await response.json();
        setSurveys(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Anketler alınırken hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  const handleRowClick = (surveyId) => {
    navigate(`/surveys/${surveyId}`);
  };

  const handleDelete = async (event, surveyId) => {
    event.stopPropagation();
    const confirmed = window.confirm("Bu anketi silmek istediğine emin misin?");
    if (!confirmed) return;

    try {
      const response = await authService.fetchWithAuth(
        `/api/surveys/${surveyId}`,
        {
          method: "DELETE",
        }
      );

      if (response.status === 403) {
        setError("Yayında olan anket silinemez.");
        return;
      }

      if (!response.ok) {
        throw new Error("Anket silinirken hata oluştu");
      }

      setSurveys((prev) => prev.filter((s) => s.surveyId !== surveyId));
    } catch (err) {
      setError(err.message || "Anket silinirken hata oluştu");
    }
  };

  const handleCopy = async (event, survey) => {
    event.stopPropagation();
    const defaultName = `${survey.name} - Kopya`;
    const newName = window.prompt("Yeni anket adı", defaultName);
    if (!newName) return;

    try {
      const response = await authService.fetchWithAuth(
        `/api/surveys/${survey.surveyId}/duplicate`,
        {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: newName,
        }
      );

      if (!response.ok) {
        throw new Error("Anket kopyalanırken hata oluştu");
      }

      // Kopyalanan anketi görmek için listeyi tazele
      const listResponse = await authService.fetchWithAuth("/api/surveys", {
        method: "GET",
      });
      if (listResponse.ok) {
        const data = await listResponse.json();
        setSurveys(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message || "Anket kopyalanırken hata oluştu");
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        Oluşturulan Anketler
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Toplam {surveys.length} anket listeleniyor.
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: 4,
            overflow: "hidden",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "grey.100" }}>
                <TableCell sx={{ fontWeight: 600, width: 64 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ad</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Başlangıç</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Bitiş</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Kişi Sayısı</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 140 }} align="right">
                  İşlemler
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {surveys.map((survey, index) => (
                <TableRow
                  key={survey.surveyId}
                  hover
                  sx={{ cursor: "default" }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{survey.name}</TableCell>
                  <TableCell>{formatDateTime(survey.startDate)}</TableCell>
                  <TableCell>{formatDateTime(survey.endDate)}</TableCell>
                  <TableCell>{formatStatus(survey.status)}</TableCell>
                  <TableCell>
                    {Array.isArray(survey.usersToSend)
                      ? survey.usersToSend.length
                      : 0}
                  </TableCell>
                  <TableCell align="right">
                    {String(survey.status).toUpperCase() === "PUBLISHED" ? (
                      <Tooltip title="Görüntüle">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/surveys/${survey.surveyId}`);
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Düzenle">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/surveys/${survey.surveyId}`);
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Kopyala">
                      <IconButton
                        size="small"
                        onClick={(e) => handleCopy(e, survey)}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {String(survey.status).toUpperCase() !== "PUBLISHED" && (
                      <Tooltip title="Sil">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => handleDelete(e, survey.surveyId)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {surveys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Henüz anket bulunmuyor.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default SurveyList;
