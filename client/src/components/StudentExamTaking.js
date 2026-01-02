import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const StudentExamTaking = () => {
  const { examId, attemptId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch exam and attempt data
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        const [examRes, attemptRes] = await Promise.all([
          api.get(`/ai-exams/${examId}`),
          attemptId ? api.get(`/exam-attempts/${attemptId}`) : null,
        ]);

        setExam(examRes.data.data);
        if (attemptRes) {
          setAttempt(attemptRes.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error loading exam");
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId, attemptId]);

  const handleAutoSubmit = React.useCallback(async () => {
    if (!attempt) return;
    try {
      await api.post(`/ai-exams/attempts/${attempt._id}/submit`, {});
      navigate(`/exam-results/${attempt._id}`);
    } catch (err) {
      console.error("Auto-submit error:", err);
    }
  }, [attempt, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!attempt || attempt.status !== "in-progress") return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [attempt, handleAutoSubmit]);

  // Set initial timer
  useEffect(() => {
    if (exam && attempt && attempt.status === "in-progress") {
      const startTime = new Date(attempt.startTime);
      const duration = exam.examSettings.duration * 60; // convert to seconds
      const elapsedTime = Math.floor((new Date() - startTime) / 1000);
      const remaining = Math.max(0, duration - elapsedTime);
      setTimeRemaining(remaining);
    }
  }, [exam, attempt]);

  const handleStartExam = async () => {
    try {
      const response = await api.post(`/ai-exams/${examId}/start`, {});
      setAttempt(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error starting exam");
    }
  };

  const handleAnswerChange = async (selectedOption, selectedAnswer) => {
    if (!attempt) return;

    const currentQuestion = exam.questions[currentQuestionIndex];
    try {
      console.log('Sending answer for question:', {
        questionId: currentQuestion.questionId || currentQuestion._id,
        selectedOption,
        selectedAnswer
      });
      await api.put(`/ai-exams/attempts/${attempt._id}/answer`, {
        questionId: currentQuestion.questionId || currentQuestion._id,
        selectedOption,
        selectedAnswer,
        timeSpentOnQuestion: 0,
      });

      // Update local attempt state
      const updatedAnswers = [...attempt.answers];
      updatedAnswers[currentQuestionIndex] = {
        ...updatedAnswers[currentQuestionIndex],
        selectedOption,
        selectedAnswer,
      };
      setAttempt({ ...attempt, answers: updatedAnswers });
    } catch (err) {
      setError("Error saving answer");
    }
  };

  const handleSubmitExam = async () => {
    try {
      setIsSubmitting(true);
      const response = await api.post(`/ai-exams/attempts/${attempt._id}/submit`, {});
      navigate(`/exam-results/${response.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Error submitting exam");
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };



  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="p-8 text-center">Loading exam...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  if (!exam) {
    return <div className="p-8 text-center">Exam not found</div>;
  }

  if (!attempt) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">{exam.title}</h2>
        <p className="mb-4">{exam.description}</p>
        <div className="bg-blue-50 p-4 rounded mb-6">
          <p className="mb-2">
            <strong>Duration:</strong> {exam.examSettings.duration} minutes
          </p>
          <p className="mb-2">
            <strong>Total Questions:</strong>{" "}
            {exam.examSettings.numberOfQuestions}
          </p>
          <p className="mb-2">
            <strong>Total Marks:</strong> {exam.examSettings.totalMarks}
          </p>
        </div>
        <button
          onClick={handleStartExam}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Start Exam
        </button>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const currentAnswer = attempt.answers[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / exam.questions.length) * 100;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel - Questions List */}
      <div className="w-1/4 bg-white p-4 overflow-y-auto border-r">
        <h3 className="font-bold mb-4">Questions ({currentQuestionIndex + 1} of {exam.questions.length})</h3>
        <div className="space-y-2">
          {exam.questions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-full p-2 text-sm rounded text-left ${idx === currentQuestionIndex
                ? "bg-blue-500 text-white"
                : attempt.answers[idx]?.selectedOption
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-700"
                }`}
            >
              Q{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Center Panel - Exam Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Timer */}
        <div className="mb-6 p-4 bg-red-50 rounded border border-red-200">
          <p className="text-lg font-bold">
            Time Remaining: <span className="text-red-600">{formatTime(timeRemaining)}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <p className="font-semibold">Progress</p>
            <p className="text-sm text-gray-600">{Math.round(progressPercent)}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">
              Question {currentQuestionIndex + 1} ({currentQuestion.marks} marks)
            </h2>
            <p className="text-gray-600">{currentQuestion.questionText}</p>
            {currentQuestion.imageUrl && (
              <img src={currentQuestion.imageUrl} alt="Question" className="mt-4 max-w-md" />
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 mt-6">
            {currentQuestion.questionType === "mcq" ? (
              currentQuestion.options.map((option, idx) => (
                <label key={idx} className="flex items-center p-3 border rounded cursor-pointer hover:bg-blue-50">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.questionId}`}
                    value={option.optionText}
                    checked={currentAnswer?.selectedOption === option.optionText}
                    onChange={() => handleAnswerChange(option.optionText, null)}
                    className="mr-3"
                  />
                  <span>{option.optionText}</span>
                </label>
              ))
            ) : currentQuestion.questionType === "short-answer" || currentQuestion.questionType === "essay" ? (
              <textarea
                value={currentAnswer?.selectedAnswer || ""}
                onChange={(e) => handleAnswerChange(null, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-3 border rounded"
                rows="6"
              />
            ) : (
              <input
                type="text"
                value={currentAnswer?.selectedAnswer || ""}
                onChange={(e) => handleAnswerChange(null, e.target.value)}
                placeholder="Enter your answer..."
                className="w-full p-3 border rounded"
              />
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Controls */}
      <div className="w-1/5 bg-white p-6 border-l space-y-4">
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm font-semibold mb-2">Question {currentQuestionIndex + 1}</p>
          <p className="text-xs text-gray-600">
            {currentQuestion.difficulty && `Difficulty: ${currentQuestion.difficulty}`}
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="w-full bg-gray-200 text-gray-800 py-2 rounded disabled:opacity-50"
          >
            ← Previous
          </button>

          <button
            onClick={() =>
              setCurrentQuestionIndex(Math.min(exam.questions.length - 1, currentQuestionIndex + 1))
            }
            disabled={currentQuestionIndex === exam.questions.length - 1}
            className="w-full bg-gray-200 text-gray-800 py-2 rounded disabled:opacity-50"
          >
            Next →
          </button>
        </div>

        <button
          onClick={() => setShowConfirmSubmit(true)}
          className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700"
        >
          Submit Exam
        </button>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md">
            <h3 className="text-lg font-bold mb-4">Submit Exam?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your exam? You cannot change your answers after submission.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded"
              >
                Continue
              </button>
              <button
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentExamTaking;
