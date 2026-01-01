import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { subjectService } from "../services/subjectService";
import { classService } from "../services/classService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";

const CreateExam = ({ onExamCreated }) => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showToast } = useToast();
  const isEditMode = !!examId;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    examType: "test",
    status: "draft",
    subject: "",
    class: "",
    examSettings: {
      duration: 60,
      totalMarks: 100,
      passingMarks: 40,
      numberOfQuestions: 0,
      questionsPerPage: 5,
      showResults: true,
      showAnswers: false,
      allowReview: true,
      randomizeQuestions: true,
      randomizeOptions: true,
      negativeMarking: false,
      negativeMarkingValue: 0,
      immediateScoring: true,
    },
    scheduledDate: "",
    startTime: "",
    endTime: "",
    tags: [],
    aiFeatures: {
      autoGenerateQuestions: false,
      autoGradeEssay: false,
      detectCheating: false,
      aiAnalytics: true,
    },
  });

  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: "",
    questionType: "mcq",
    difficulty: "medium",
    marks: 1,
    options: [
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
    ],
    correctAnswer: "",
    answerExplanation: "",
    topicTags: [],
  });

  const [step, setStep] = useState(1); // 1: Exam Details, 2: Questions, 3: Review
  const [loading, setLoading] = useState(false);

  // Fetch subjects and classes on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoadingDropdowns(true);
        const [subjectsData, classesData] = await Promise.all([
          subjectService.getAllSubjects(),
          classService.getAllClasses(),
        ]);

        setSubjects(subjectsData || []);
        setClasses(classesData || []);

        // If in edit mode, fetch the existing exam data
        if (isEditMode) {
          const response = await api.get(`/ai-exams/${examId}`);
          const examData = response.data.data;

          if (examData) {
            setFormData({
              title: examData.title || "",
              description: examData.description || "",
              examType: examData.examType || "test",
              status: examData.status || "draft",
              subject: examData.subject?._id || examData.subject || "",
              class: examData.class?._id || examData.class || "",
              examSettings: {
                ...examData.examSettings,
                duration: examData.examSettings.duration || 60,
                totalMarks: examData.examSettings.totalMarks || 100,
                passingMarks: examData.examSettings.passingMarks || 40,
              },
              scheduledDate: examData.scheduledDate ? examData.scheduledDate.split('T')[0] : "",
              startTime: examData.startTime || "",
              endTime: examData.endTime || "",
              tags: examData.tags || [],
              aiFeatures: examData.aiFeatures || {
                autoGenerateQuestions: false,
                autoGradeEssay: false,
                detectCheating: false,
                aiAnalytics: true,
              },
            });
            setQuestions(examData.questions || []);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showToast("Error loading exam data", "error");
      } finally {
        setLoadingDropdowns(false);
      }
    };

    if (token) {
      fetchDropdownData();
    }
  }, [token, showToast, examId, isEditMode]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes("examSettings.")) {
      const settingName = name.split(".")[1];
      setFormData({
        ...formData,
        examSettings: {
          ...formData.examSettings,
          [settingName]: type === "checkbox" ? checked : isNaN(value) ? value : parseInt(value),
        },
      });
    } else if (name.includes("aiFeatures.")) {
      const featureName = name.split(".")[1];
      setFormData({
        ...formData,
        aiFeatures: {
          ...formData.aiFeatures,
          [featureName]: checked,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("option-")) {
      const optionIndex = parseInt(name.split("-")[1]);
      const newOptions = [...currentQuestion.options];
      newOptions[optionIndex].optionText = value;
      setCurrentQuestion({
        ...currentQuestion,
        options: newOptions,
      });
    } else if (name.includes("isCorrect-")) {
      const optionIndex = parseInt(name.split("-")[1]);
      const newOptions = [...currentQuestion.options];
      newOptions.forEach((opt, idx) => {
        opt.isCorrect = idx === optionIndex;
      });
      setCurrentQuestion({
        ...currentQuestion,
        options: newOptions,
        correctAnswer: newOptions[optionIndex].optionText,
      });
    } else {
      setCurrentQuestion({
        ...currentQuestion,
        [name]: value,
      });
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.questionText) {
      showToast("Question text is required", "error");
      return;
    }

    if (currentQuestion.questionType === "mcq" && !currentQuestion.correctAnswer) {
      showToast("Please select the correct answer", "error");
      return;
    }

    setQuestions([...questions, { ...currentQuestion, id: Date.now() }]);
    setCurrentQuestion({
      questionText: "",
      questionType: "mcq",
      difficulty: "medium",
      marks: 1,
      options: [
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ],
      correctAnswer: "",
      answerExplanation: "",
      topicTags: [],
    });
    showToast("Question added successfully", "success");
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter((q) => (q.id || q._id || q.questionId) !== id));
    showToast("Question removed", "success");
  };

  const handleCreateExam = async () => {
    try {
      if (!formData.title || !formData.subject || !formData.class) {
        showToast("Please fill all required fields", "error");
        return;
      }

      if (questions.length === 0) {
        showToast("Please add at least one question", "error");
        return;
      }

      setLoading(true);

      const examPayload = {
        ...formData,
        questions: questions.map((q) => {
          const qId = q.questionId || q._id || q.id;
          const isObjectId = typeof qId === "string" && /^[0-9a-fA-F]{24}$/.test(qId);

          return {
            questionId: isObjectId ? qId : undefined,
            questionText: q.questionText,
            questionType: q.questionType,
            difficulty: q.difficulty,
            marks: q.marks,
            options: q.options,
            correctAnswer: q.correctAnswer,
            answerExplanation: q.answerExplanation,
            topicTags: q.topicTags,
          };
        }),
        examSettings: {
          ...formData.examSettings,
          numberOfQuestions: questions.length,
        },
      };

      console.log("Submitting exam payload:", examPayload);

      if (isEditMode) {
        await api.put(`/ai-exams/${examId}`, examPayload);
        showToast("Exam updated successfully!", "success");
      } else {
        const response = await api.post("/ai-exams", examPayload);
        showToast("Exam created successfully!", "success");
        if (onExamCreated) {
          onExamCreated(response.data.data);
          return; // Stop here if we have a callback
        }
      }

      navigate("/ai-exams");
      setStep(1);
      setFormData({
        title: "",
        description: "",
        examType: "test",
        subject: "",
        class: "",
        examSettings: {
          duration: 60,
          totalMarks: 100,
          passingMarks: 40,
          numberOfQuestions: 0,
          questionsPerPage: 5,
          showResults: true,
          showAnswers: false,
          allowReview: true,
          randomizeQuestions: true,
          randomizeOptions: true,
          negativeMarking: false,
          negativeMarkingValue: 0,
          immediateScoring: true,
        },
        scheduledDate: "",
        startTime: "",
        endTime: "",
        tags: [],
        aiFeatures: {
          autoGenerateQuestions: false,
          autoGradeEssay: false,
          detectCheating: false,
          aiAnalytics: true,
        },
      });
      setQuestions([]);
    } catch (error) {
      showToast(error.response?.data?.message || "Error creating exam", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded shadow-lg p-8">
      <h1 className="text-3xl font-bold mb-8">Create AI Exam</h1>

      {/* Step Indicator */}
      <div className="flex gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`flex-1 py-3 rounded font-semibold ${step === s
              ? "bg-blue-600 text-white"
              : step > s
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-600"
              }`}
          >
            Step {s}
          </button>
        ))}
      </div>

      {/* Step 1: Exam Details */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">Exam Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="e.g., Mathematics Final Exam"
                className="w-full p-3 border rounded"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Exam Type *</label>
              <select
                name="examType"
                value={formData.examType}
                onChange={handleFormChange}
                className="w-full p-3 border rounded"
              >
                <option value="quiz">Quiz</option>
                <option value="test">Test</option>
                <option value="mid-term">Mid-Term</option>
                <option value="final">Final</option>
                <option value="practice">Practice</option>
                <option value="mock">Mock</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="w-full p-3 border rounded"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Exam description..."
              className="w-full p-3 border rounded"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">Subject *</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleFormChange}
                className="w-full p-3 border rounded"
                disabled={loadingDropdowns}
              >
                <option value="">Select a subject...</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.subjectName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2">Class *</label>
              <select
                name="class"
                value={formData.class}
                onChange={handleFormChange}
                className="w-full p-3 border rounded"
                disabled={loadingDropdowns}
              >
                <option value="">Select a class...</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.className}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exam Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">Exam Settings</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  name="examSettings.duration"
                  value={formData.examSettings.duration}
                  onChange={handleFormChange}
                  className="w-full p-3 border rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Total Marks</label>
                <input
                  type="number"
                  name="examSettings.totalMarks"
                  value={formData.examSettings.totalMarks}
                  onChange={handleFormChange}
                  className="w-full p-3 border rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Passing Marks</label>
                <input
                  type="number"
                  name="examSettings.passingMarks"
                  value={formData.examSettings.passingMarks}
                  onChange={handleFormChange}
                  className="w-full p-3 border rounded"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="examSettings.showResults"
                  checked={formData.examSettings.showResults}
                  onChange={handleFormChange}
                  className="mr-2"
                />
                Show Results to Students
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="examSettings.showAnswers"
                  checked={formData.examSettings.showAnswers}
                  onChange={handleFormChange}
                  className="mr-2"
                />
                Show Correct Answers
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="examSettings.allowReview"
                  checked={formData.examSettings.allowReview}
                  onChange={handleFormChange}
                  className="mr-2"
                />
                Allow Review
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="examSettings.randomizeQuestions"
                  checked={formData.examSettings.randomizeQuestions}
                  onChange={handleFormChange}
                  className="mr-2"
                />
                Randomize Questions
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(2)}
              className="flex-1 bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700"
            >
              Next: Add Questions
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Add Questions */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Add Question Form */}
          <div className="border p-6 rounded bg-gray-50">
            <h3 className="text-lg font-bold mb-4">Add Question</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-semibold mb-2">Question Type</label>
                <select
                  name="questionType"
                  value={currentQuestion.questionType}
                  onChange={handleQuestionChange}
                  className="w-full p-3 border rounded"
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="short-answer">Short Answer</option>
                  <option value="essay">Essay</option>
                  <option value="fill-blank">Fill in Blank</option>
                  <option value="true-false">True/False</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-2">Difficulty</label>
                <select
                  name="difficulty"
                  value={currentQuestion.difficulty}
                  onChange={handleQuestionChange}
                  className="w-full p-3 border rounded"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2">Question Text *</label>
              <textarea
                name="questionText"
                value={currentQuestion.questionText}
                onChange={handleQuestionChange}
                placeholder="Enter question text..."
                className="w-full p-3 border rounded"
                rows="3"
              />
            </div>

            {currentQuestion.questionType === "mcq" && (
              <div className="mb-4">
                <label className="block font-semibold mb-2">Options</label>
                <div className="space-y-2">
                  {currentQuestion.options.map((option, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={option.optionText}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[idx].optionText = e.target.value;
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: newOptions,
                          });
                        }}
                        className="flex-1 p-2 border rounded"
                      />
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`correct-${currentQuestion.questionText}`}
                          checked={option.isCorrect}
                          onChange={() => {
                            const newOptions = [...currentQuestion.options];
                            newOptions.forEach((o, i) => {
                              o.isCorrect = i === idx;
                            });
                            setCurrentQuestion({
                              ...currentQuestion,
                              options: newOptions,
                              correctAnswer: newOptions[idx].optionText,
                            });
                          }}
                          className="mr-2"
                        />
                        Correct
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-semibold mb-2">Marks</label>
                <input
                  type="number"
                  name="marks"
                  value={currentQuestion.marks}
                  onChange={handleQuestionChange}
                  min="1"
                  className="w-full p-3 border rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Topic Tags</label>
                <input
                  type="text"
                  name="topicTags"
                  placeholder="e.g., algebra, geometry"
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      topicTags: e.target.value.split(",").map((t) => t.trim()),
                    })
                  }
                  className="w-full p-3 border rounded"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2">Explanation</label>
              <textarea
                name="answerExplanation"
                value={currentQuestion.answerExplanation}
                onChange={handleQuestionChange}
                placeholder="Explain the correct answer..."
                className="w-full p-3 border rounded"
                rows="2"
              />
            </div>

            <button
              onClick={addQuestion}
              className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700"
            >
              Add Question
            </button>
          </div>

          {/* Questions List */}
          <div>
            <h3 className="text-lg font-bold mb-4">Questions Added ({questions.length})</h3>
            <div className="space-y-3">
              {questions.map((question, idx) => (
                <div key={question.id || question._id || idx} className="p-4 bg-gray-50 rounded border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">Q{idx + 1}: {question.questionText}</p>
                      <p className="text-sm text-gray-600">
                        Type: {question.questionType} | Difficulty: {question.difficulty} | Marks: {question.marks}
                      </p>
                    </div>
                    <button
                      onClick={() => removeQuestion(question.id || question._id || question.questionId)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-600 text-white py-3 rounded font-semibold hover:bg-gray-700"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={questions.length === 0}
              className="flex-1 bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              Review & Create
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded">
            <h3 className="text-lg font-bold mb-4">Exam Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <strong>Title:</strong> {formData.title}
              </p>
              <p>
                <strong>Type:</strong> {formData.examType}
              </p>
              <p>
                <strong>Duration:</strong> {formData.examSettings.duration} minutes
              </p>
              <p>
                <strong>Total Marks:</strong> {formData.examSettings.totalMarks}
              </p>
              <p>
                <strong>Total Questions:</strong> {questions.length}
              </p>
              <p>
                <strong>Passing Marks:</strong> {formData.examSettings.passingMarks}
              </p>
              <p>
                <strong>Status:</strong> <span className="capitalize">{formData.status}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(2)}
              className="flex-1 bg-gray-600 text-white py-3 rounded font-semibold hover:bg-gray-700"
            >
              Back
            </button>
            <button
              onClick={handleCreateExam}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {loading
                ? (isEditMode ? "Updating..." : "Creating...")
                : (isEditMode ? "Update Exam" : "Create Exam")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateExam;
