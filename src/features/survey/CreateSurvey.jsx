import { useState } from "react";
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
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { authService } from "../auth/authService";

function CreateSurvey({ inline = false, redirectOnSuccess = true, onSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    status: "DRAFT",
    startDate: "",
    endDate: "",
    usersToSend: "",
    sections: [
      {
        sectionName: "",
        priority: 1,
        questions: [
          {
            questionText: "",
            questionType: "",
            questionPriority: 1,
            questionAnswers: "",
          },
        ],
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const normalizeDateTime = (value) => {
    if (!value) return null;
    // datetime-local genelde "YYYY-MM-DDTHH:mm" gelir, backend örneğinde saniye var
    return value.length === 16 ? `${value}:00` : value;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleSectionChange = (sectionIndex, field, value) => {
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
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          sectionName: "",
          priority: prev.sections.length + 1,
          questions: [
            {
              questionText: "",
              questionType: "",
              questionPriority: 1,
              questionAnswers: "",
            },
          ],
        },
      ],
    }));
  };

  const addQuestion = (sectionIndex) => {
    setFormData((prev) => {
      const sections = [...prev.sections];
      const questions = [...sections[sectionIndex].questions];
      questions.push({
        questionText: "",
        questionType: "",
        questionPriority: questions.length + 1,
        questionAnswers: "",
      });
      sections[sectionIndex] = {
        ...sections[sectionIndex],
        questions,
      };
      return { ...prev, sections };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const usersToSendList = formData.usersToSend
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);

      const payload = {
        // surveyId backend'de üretilecek, gönderilmiyor
        name: formData.name,
        status: formData.status,
        startDate: normalizeDateTime(formData.startDate),
        endDate: normalizeDateTime(formData.endDate),
        usersToSend: usersToSendList,
        sections: formData.sections.map((section) => ({
          // sectionId, surveyId backend'de üretilecek
          sectionName: section.sectionName,
          priority: section.priority,
          questions: section.questions.map((q) => ({
            // questionId, sectionId, surveyId backend'de üretilecek
            questionType: q.questionType,
            questionPriority: q.questionPriority,
            questionText: q.questionText,
            // Backend örneğinde olduğu gibi tek string ("1,2,3,4,5" vb.)
            questionAnswers: q.questionAnswers || "",
          })),
        })),
      };

      // /api/surveys -> Vite proxy üzerinden http://localhost:8080/api/surveys'e gider
      const response = await authService.fetchWithAuth(
        "http://localhost:8080/api/surveys",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

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

        console.error("Survey creation failed:", errorMessage);
        throw new Error(errorMessage);
      }

      setSuccess("Survey created successfully");
      if (onSuccess) {
        onSuccess();
      }
      if (redirectOnSuccess) {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Survey creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={inline ? "md" : "sm"}>
      <Box
        sx={{
          minHeight: inline ? "auto" : "100vh",
          display: "flex",
          alignItems: inline ? "flex-start" : "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            width: "100%",
            borderRadius: 3,
            background: "linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Add sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              gutterBottom
            >
              Create New Survey
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Define basic information for your survey. Further structure
              (sections/questions) can be added later on backend.
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Start Date"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="End Date"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Users To Send (comma separated emails)"
              name="usersToSend"
              value={formData.usersToSend}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
            />

            {formData.sections.map((section, sIndex) => (
              <Box
                key={sIndex}
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  bgcolor: "#fafafa",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Section {sIndex + 1}
                </Typography>
                <TextField
                  fullWidth
                  label="Section Name"
                  value={section.sectionName}
                  onChange={(e) =>
                    handleSectionChange(sIndex, "sectionName", e.target.value)
                  }
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Section Priority"
                  type="number"
                  value={section.priority}
                  onChange={(e) =>
                    handleSectionChange(
                      sIndex,
                      "priority",
                      Number(e.target.value)
                    )
                  }
                  margin="normal"
                  variant="outlined"
                />

                {section.questions.map((q, qIndex) => (
                  <Box
                    key={qIndex}
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      border: "1px dashed #ddd",
                      bgcolor: "#fff",
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      Question {qIndex + 1}
                    </Typography>
                    <TextField
                      fullWidth
                      label="Question Text"
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
                    />
                    <TextField
                      fullWidth
                      label="Question Type (enum)"
                      helperText="QuestionTypeEnum değerini yazın (ör. TEXT, SCALE vb.)"
                      value={q.questionType}
                      onChange={(e) =>
                        handleQuestionChange(
                          sIndex,
                          qIndex,
                          "questionType",
                          e.target.value
                        )
                      }
                      margin="normal"
                      variant="outlined"
                    />
                    <TextField
                      fullWidth
                      label="Question Priority"
                      type="number"
                      value={q.questionPriority}
                      onChange={(e) =>
                        handleQuestionChange(
                          sIndex,
                          qIndex,
                          "questionPriority",
                          Number(e.target.value)
                        )
                      }
                      margin="normal"
                      variant="outlined"
                    />
                    <TextField
                      fullWidth
                      label="Question Answers (comma separated)"
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
                    />
                  </Box>
                ))}

                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={() => addQuestion(sIndex)}
                >
                  Add Question
                </Button>
              </Box>
            ))}

            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              onClick={addSection}
            >
              Add Section
            </Button>

            <TextField
              select
              fullWidth
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
            >
              <MenuItem value="DRAFT">Draft</MenuItem>
              <MenuItem value="PUBLISHED">Published</MenuItem>
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create Survey"
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
            >
              Cancel
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default CreateSurvey;
