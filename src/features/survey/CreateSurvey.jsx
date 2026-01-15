import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  Menu,
  Divider,
  Chip,
  Stack,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Add,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Delete as DeleteIcon,
  CalendarToday,
} from "@mui/icons-material";
import { authService } from "../auth/authService";

function CreateSurvey({
  inline = false,
  redirectOnSuccess = true,
  onSuccess,
  mode = "create",
  surveyId,
  initialSurvey,
}) {
  const navigate = useNavigate();
  const endDateInputRef = useRef(null);
  const isEdit = mode === "edit";
  const isReadOnly = isEdit && initialSurvey?.status === "PUBLISHED";
  const [formData, setFormData] = useState({
    name: "",
    status: "DRAFT",
    endDate: "",
    usersToSend: "",
    sections: [
      {
        sectionName: "",
        priority: 1,
        questions: [],
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [questionTypeAnchorEl, setQuestionTypeAnchorEl] = useState(null);
  const [questionMenuSectionIndex, setQuestionMenuSectionIndex] =
    useState(null);

  useEffect(() => {
    if (!isEdit || !initialSurvey) return;

    setFormData({
      name: initialSurvey.name || "",
      status: initialSurvey.status || "DRAFT",
      endDate: initialSurvey.endDate || "",
      usersToSend: Array.isArray(initialSurvey.usersToSend)
        ? initialSurvey.usersToSend.join(", ")
        : "",
      sections:
        Array.isArray(initialSurvey.sections) &&
        initialSurvey.sections.length > 0
          ? initialSurvey.sections.map((section, sIndex) => ({
              sectionId: section.sectionId,
              sectionName: section.sectionName || "",
              priority:
                typeof section.priority === "number"
                  ? section.priority
                  : sIndex + 1,
              questions:
                Array.isArray(section.questions) && section.questions.length > 0
                  ? section.questions.map((q, qIndex) => ({
                      questionId: q.questionId,
                      questionText: q.questionText || "",
                      questionType: q.questionType || "Text",
                      questionPriority:
                        typeof q.questionPriority === "number"
                          ? q.questionPriority
                          : qIndex + 1,
                      questionAnswers: q.questionAnswers || "",
                    }))
                  : [],
            }))
          : [
              {
                sectionName: "",
                priority: 1,
                questions: [],
              },
            ],
    });
  }, [isEdit, initialSurvey]);

  const normalizeDateTime = (value) => {
    if (!value) return null;
    // datetime-local genelde "YYYY-MM-DDTHH:mm" gelir, backend örneğinde saniye var
    return value.length === 16 ? `${value}:00` : value;
  };

  const handleChange = (e) => {
    if (isReadOnly) return;
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleSectionChange = (sectionIndex, field, value) => {
    if (isReadOnly) return;
    setFormData((prev) => {
      const sections = [...prev.sections];
      sections[sectionIndex] = {
        ...sections[sectionIndex],
        [field]: value,
      };
      return { ...prev, sections };
    });
  };

  const handleQuestionChange = (sectionIndex, questionIndex, field, value) => {
    if (isReadOnly) return;
    setFormData((prev) => {
      const sections = [...prev.sections];
      const questions = [...sections[sectionIndex].questions];
      questions[questionIndex] = {
        ...questions[questionIndex],
        [field]: value,
      };
      sections[sectionIndex] = {
        ...sections[sectionIndex],
        questions,
      };
      return { ...prev, sections };
    });
  };

  const addSection = () => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          sectionName: "",
          priority: prev.sections.length + 1,
          questions: [],
        },
      ],
    }));
  };

  const addQuestion = (sectionIndex, event) => {
    if (isReadOnly) return;
    setQuestionMenuSectionIndex(sectionIndex);
    setQuestionTypeAnchorEl(event.currentTarget);
  };

  const addQuestionOfType = (sectionIndex, type) => {
    setFormData((prev) => {
      const sections = [...prev.sections];
      const questions = [...sections[sectionIndex].questions];
      const nextPriority = questions.length + 1;

      questions.push({
        questionText: "",
        questionType: type,
        questionPriority: nextPriority,
        questionAnswers: type === "Likert" ? "1,2,3,4,5" : "",
      });

      sections[sectionIndex] = {
        ...sections[sectionIndex],
        questions,
      };

      return { ...prev, sections };
    });
  };

  const handleSelectQuestionType = (type) => {
    if (questionMenuSectionIndex === null) return;
    addQuestionOfType(questionMenuSectionIndex, type);
    setQuestionTypeAnchorEl(null);
    setQuestionMenuSectionIndex(null);
  };

  const handleCloseQuestionTypeMenu = () => {
    setQuestionTypeAnchorEl(null);
    setQuestionMenuSectionIndex(null);
  };

  const moveSection = (fromIndex, toIndex) => {
    if (isReadOnly) return;
    setFormData((prev) => {
      const sections = [...prev.sections];
      if (toIndex < 0 || toIndex >= sections.length) {
        return prev;
      }

      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);

      const updatedSections = sections.map((s, idx) => ({
        ...s,
        priority: idx + 1,
      }));

      return { ...prev, sections: updatedSections };
    });
  };

  const moveSectionUp = (index) => {
    moveSection(index, index - 1);
  };

  const moveSectionDown = (index) => {
    moveSection(index, index + 1);
  };

  const moveQuestion = (sectionIndex, fromIndex, toIndex) => {
    if (isReadOnly) return;
    setFormData((prev) => {
      const sections = [...prev.sections];
      const section = sections[sectionIndex];
      if (!section) return prev;

      const questions = [...section.questions];
      if (toIndex < 0 || toIndex >= questions.length) {
        return prev;
      }

      const [moved] = questions.splice(fromIndex, 1);
      questions.splice(toIndex, 0, moved);

      const updatedQuestions = questions.map((q, idx) => ({
        ...q,
        questionPriority: idx + 1,
      }));

      sections[sectionIndex] = {
        ...section,
        questions: updatedQuestions,
      };

      return { ...prev, sections };
    });
  };

  const moveQuestionUp = (sectionIndex, index) => {
    moveQuestion(sectionIndex, index, index - 1);
  };

  const moveQuestionDown = (sectionIndex, index) => {
    moveQuestion(sectionIndex, index, index + 1);
  };

  const removeSection = (sectionIndex) => {
    if (isReadOnly) return;
    setFormData((prev) => {
      const sections = [...prev.sections];
      if (sections.length <= 1) {
        return prev;
      }

      sections.splice(sectionIndex, 1);
      const updatedSections = sections.map((section, idx) => ({
        ...section,
        priority: idx + 1,
      }));

      return { ...prev, sections: updatedSections };
    });
  };

  const removeQuestion = (sectionIndex, questionIndex) => {
    if (isReadOnly) return;
    setFormData((prev) => {
      const sections = [...prev.sections];
      const section = sections[sectionIndex];
      if (!section) return prev;

      const questions = [...section.questions];
      if (questionIndex < 0 || questionIndex >= questions.length) {
        return prev;
      }

      questions.splice(questionIndex, 1);
      const updatedQuestions = questions.map((q, idx) => ({
        ...q,
        questionPriority: idx + 1,
      }));

      sections[sectionIndex] = {
        ...section,
        questions: updatedQuestions,
      };

      return { ...prev, sections };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const usersToSendList = formData.usersToSend
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name,
        status: formData.status,
        startDate:
          isEdit && initialSurvey ? initialSurvey.startDate || null : null,
        endDate: normalizeDateTime(formData.endDate),
        usersToSend: usersToSendList,
        sections: formData.sections.map((section) => ({
          sectionId: section.sectionId,
          sectionName: section.sectionName,
          priority: section.priority,
          questions: section.questions.map((q) => ({
            questionId: q.questionId,
            questionType: q.questionType,
            questionPriority: q.questionPriority,
            questionText: q.questionText,
            // Backend örneğinde olduğu gibi tek string ("1,2,3,4,5" vb.)
            questionAnswers: q.questionAnswers || "",
          })),
        })),
      };

      const endpoint =
        isEdit && surveyId ? `/api/surveys/${surveyId}` : "/api/surveys";
      const method = isEdit && surveyId ? "PUT" : "POST";

      const response = await authService.fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = "Survey creation failed";
        try {
          const data = await response.json();
          if (typeof data === "string") {
            errorMessage = data;
          } else if (data) {
            errorMessage =
              data.message ||
              data.error ||
              (Array.isArray(data.errors) && data.errors.length > 0
                ? data.errors[0].defaultMessage || String(data.errors[0])
                : errorMessage);
          }
        } catch {
          try {
            const text = await response.text();
            if (text) errorMessage = text;
          } catch {
            // ignore
          }
        }

        console.error("Survey save failed:", errorMessage);
        throw new Error(errorMessage);
      }

      setSuccess(
        isEdit ? "Survey updated successfully" : "Survey created successfully"
      );
      if (onSuccess) {
        onSuccess();
      }
      if (redirectOnSuccess) {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Survey save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={false} disableGutters>
      <Box
        sx={{
          minHeight: inline ? "auto" : "100vh",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "flex-start",
          justifyContent: "flex-start",
          gap: 2,
          py: 2,
          px: 4,
        }}
      >
        <Box sx={{ flex: 0.8, width: "100%" }}>
          <Paper
            elevation={8}
            sx={{
              p: 4,
              borderRadius: 2,
              border: "1px solid rgba(15,23,42,0.06)",
              backgroundColor: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: "primary.main", letterSpacing: 1, mb: 1 }}
            >
              {isEdit ? "Anketi Düzenle" : "Yeni Anket"}
            </Typography>
            <Typography
              variant="h5"
              component="h1"
              fontWeight="600"
              gutterBottom
            >
              Başlık ve temel bilgiler
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Anket adını, zaman aralığını ve göndermek istediğin kullanıcıları
              belirle.
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Anket Adı"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isReadOnly}
                margin="normal"
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Bitiş"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                inputRef={endDateInputRef}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Takvimden bitiş tarihi seç"
                        edge="end"
                        disabled={isReadOnly}
                        onClick={() => {
                          const el = endDateInputRef.current;
                          if (!el) return;
                          el.focus();
                          // Chromium tabanlı tarayıcılarda native picker'ı açar
                          if (typeof el.showPicker === "function") {
                            el.showPicker();
                          }
                        }}
                      >
                        <CalendarToday fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled={isReadOnly}
              />

              <TextField
                fullWidth
                label="Gönderilecek Kullanıcılar (virgülle ayır)"
                name="usersToSend"
                value={formData.usersToSend}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                placeholder="ornek@sirket.com, kisi2@sirket.com"
                disabled={isReadOnly}
              />

              <TextField
                select
                fullWidth
                label="Durum"
                name="status"
                value={formData.status}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                disabled={isReadOnly}
              >
                <MenuItem value="DRAFT">Taslak</MenuItem>
                <MenuItem value="PUBLISHED">Yayında</MenuItem>
              </TextField>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {success}
                </Alert>
              )}

              <Divider sx={{ my: 3 }} />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || isReadOnly}
                  sx={{
                    flex: 1,
                    py: 1.4,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderRadius: 999,
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : isEdit ? (
                    "Değişiklikleri Kaydet"
                  ) : (
                    "Anketi Oluştur"
                  )}
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  onClick={() => {
                    if (onSuccess) {
                      onSuccess();
                    }
                    if (redirectOnSuccess) {
                      navigate("/");
                    }
                  }}
                  sx={{ flex: 1, textTransform: "none" }}
                >
                  İptal
                </Button>
              </Stack>
            </form>
          </Paper>
        </Box>

        <Box sx={{ flex: 2, width: "100%", pr: { md: 4 } }}>
          {formData.sections.map((section, sIndex) => (
            <Paper
              key={sIndex}
              elevation={3}
              sx={{
                mb: 3,
                p: 3,
                borderRadius: 2,
                border: "1px solid rgba(148,163,184,0.35)",
                backgroundColor: "rgba(248,250,252,0.96)",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1.5 }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Bölüm {sIndex + 1}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Chip
                    label={`Öncelik: ${section.priority}`}
                    size="small"
                    variant="outlined"
                  />
                  <IconButton
                    size="small"
                    onClick={() => moveSectionUp(sIndex)}
                    disabled={sIndex === 0 || isReadOnly}
                    sx={{ p: 0.25 }}
                  >
                    <KeyboardArrowUp fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => moveSectionDown(sIndex)}
                    disabled={
                      sIndex === formData.sections.length - 1 || isReadOnly
                    }
                    sx={{ p: 0.25 }}
                  >
                    <KeyboardArrowDown fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeSection(sIndex)}
                    disabled={formData.sections.length <= 1 || isReadOnly}
                    sx={{ p: 0.25 }}
                  >
                    <DeleteIcon fontSize="inherit" />
                  </IconButton>
                </Stack>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Bölüm Adı"
                  value={section.sectionName}
                  onChange={(e) =>
                    handleSectionChange(sIndex, "sectionName", e.target.value)
                  }
                  margin="normal"
                  variant="outlined"
                  disabled={isReadOnly}
                />
              </Stack>

              <Stack spacing={2} sx={{ mt: 1 }}>
                {section.questions.map((q, qIndex) => (
                  <Paper
                    key={qIndex}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor: "rgba(148,163,184,0.5)",
                      backgroundColor: "rgba(248,250,252,0.9)",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="subtitle2" fontWeight={600}>
                        Soru {qIndex + 1}
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Chip
                          label={
                            q.questionType === "Likert"
                              ? "Likert"
                              : "Serbest Metin"
                          }
                          size="small"
                          color={
                            q.questionType === "Likert" ? "primary" : "default"
                          }
                          variant={
                            q.questionType === "Likert" ? "filled" : "outlined"
                          }
                        />
                        <IconButton
                          size="small"
                          onClick={() => moveQuestionUp(sIndex, qIndex)}
                          disabled={qIndex === 0 || isReadOnly}
                          sx={{ p: 0.25 }}
                        >
                          <KeyboardArrowUp fontSize="inherit" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => moveQuestionDown(sIndex, qIndex)}
                          disabled={
                            qIndex === section.questions.length - 1 ||
                            isReadOnly
                          }
                          sx={{ p: 0.25 }}
                        >
                          <KeyboardArrowDown fontSize="inherit" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeQuestion(sIndex, qIndex)}
                          disabled={isReadOnly}
                          sx={{ p: 0.25 }}
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <TextField
                      fullWidth
                      label="Soru Metni"
                      value={q.questionText}
                      onChange={(e) =>
                        handleQuestionChange(
                          sIndex,
                          qIndex,
                          "questionText",
                          e.target.value
                        )
                      }
                      margin="normal"
                      variant="outlined"
                      disabled={isReadOnly}
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      {q.questionType === "Likert" && (
                        <TextField
                          fullWidth
                          label="Likert Seçenekleri (virgülle ayır)"
                          helperText="Örn: 1,2,3,4,5 veya Çok katılmıyorum,Kararsızım,Katılıyorum,Çok katılıyorum"
                          value={q.questionAnswers}
                          onChange={(e) =>
                            handleQuestionChange(
                              sIndex,
                              qIndex,
                              "questionAnswers",
                              e.target.value
                            )
                          }
                          margin="normal"
                          variant="outlined"
                          multiline
                          minRows={2}
                          disabled={isReadOnly}
                        />
                      )}

                      {q.questionType === "Text" && (
                        <Box
                          sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            mt: { xs: 1, sm: 0 },
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Cevaplar serbest metin olarak toplanacak.
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                ))}
              </Stack>

              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                onClick={(e) => addQuestion(sIndex, e)}
                disabled={isReadOnly}
              >
                Soru Ekle
              </Button>
            </Paper>
          ))}

          <Button
            variant="text"
            sx={{ mt: 1 }}
            onClick={addSection}
            disabled={isReadOnly}
          >
            + Yeni Bölüm Ekle
          </Button>
        </Box>
      </Box>

      <Menu
        anchorEl={questionTypeAnchorEl}
        open={Boolean(questionTypeAnchorEl)}
        onClose={handleCloseQuestionTypeMenu}
      >
        <MenuItem onClick={() => handleSelectQuestionType("Likert")}>
          Likert
        </MenuItem>
        <MenuItem onClick={() => handleSelectQuestionType("Text")}>
          Text
        </MenuItem>
      </Menu>
    </Container>
  );
}

export default CreateSurvey;
