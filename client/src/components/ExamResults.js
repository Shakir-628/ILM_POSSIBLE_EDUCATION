import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ExamResults = () => {
  const { attemptId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const [attemptRes, analyticsRes] = await Promise.all([
          api.get(`/ai-exams/attempts/${attemptId}`),
          api.get(`/ai-exams/attempts/${attemptId}/analytics`),
        ]);

        setAttempt(attemptRes.data.data);
        setAnalytics(analyticsRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error loading results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [attemptId]);

  if (loading) {
    return <div className="p-8 text-center">Loading results...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  if (!attempt || !analytics) {
    return <div className="p-8 text-center">Results not found</div>;
  }

  const { attemptOverview, questionAnalytics, topicAnalytics, aiFeedback } = analytics;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/exams")}
          className="mb-6 text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Back to Exams
        </button>

        <div className="bg-white rounded shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">{attempt.exam?.title}</h1>
          <p className="text-gray-600 mb-6">Exam Results & Performance Analysis</p>

          {/* Score Display */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded">
              <p className="text-sm opacity-90">Total Score</p>
              <p className="text-4xl font-bold">{attemptOverview.totalMarks}</p>
              <p className="text-sm opacity-90 mt-1">out of {attemptOverview.maxMarks}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded">
              <p className="text-sm opacity-90">Percentage</p>
              <p className="text-4xl font-bold">{attemptOverview.percentage}%</p>
              <p className="text-sm opacity-90 mt-1">of total marks</p>
            </div>

            <div
              className={`bg-gradient-to-br text-white p-6 rounded ${attemptOverview.isPassed
                ? "from-green-500 to-green-600"
                : "from-red-500 to-red-600"
                }`}
            >
              <p className="text-sm opacity-90">Status</p>
              <p className="text-3xl font-bold">{attemptOverview.isPassed ? "PASSED" : "FAILED"}</p>
              <p className="text-sm opacity-90 mt-1">Grade: {attemptOverview.grade}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded">
              <p className="text-sm opacity-90">Time Spent</p>
              <p className="text-3xl font-bold">{attemptOverview.duration}</p>
              <p className="text-sm opacity-90 mt-1">minutes</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded shadow-lg mb-6">
          <div className="flex border-b">
            {["overview", "questions", "topics", "feedback"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 font-semibold capitalize border-b-2 transition ${activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
              >
                {tab === "topics" ? "Topic-wise" : tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <h3 className="text-xl font-bold mb-6">Exam Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <span className="font-semibold">Total Questions</span>
                    <span className="text-lg">{questionAnalytics.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <span className="font-semibold">Correct Answers</span>
                    <span className="text-lg text-green-600">
                      {questionAnalytics.filter((q) => q.isCorrect).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <span className="font-semibold">Wrong Answers</span>
                    <span className="text-lg text-red-600">
                      {questionAnalytics.filter((q) => !q.isCorrect).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <span className="font-semibold">Accuracy</span>
                    <span className="text-lg">
                      {(
                        (questionAnalytics.filter((q) => q.isCorrect).length /
                          questionAnalytics.length) *
                        100
                      ).toFixed(2)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Questions Tab */}
            {activeTab === "questions" && (
              <div>
                <h3 className="text-xl font-bold mb-6">Question-wise Analysis</h3>
                <div className="space-y-4">
                  {questionAnalytics.map((question) => (
                    <div
                      key={`question-${question.questionNumber}`}
                      className={`p-4 rounded border-l-4 ${question.isCorrect
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                        }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">Q{question.questionNumber}</p>
                          <p className="text-sm text-gray-700 mt-1">{question.questionText}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded text-sm font-semibold ${question.isCorrect
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                            }`}
                        >
                          {question.isCorrect ? "✓ Correct" : "✗ Wrong"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-3">
                        <p className="mb-1">
                          <strong>Difficulty:</strong> {question.difficulty}
                        </p>
                        <p className="mb-1">
                          <strong>Marks Obtained:</strong> {question.marksObtained} /{" "}
                          {question.maxMarks}
                        </p>
                        <p className="mb-1">
                          <strong>Time Spent:</strong> {question.timeSpent} seconds
                        </p>
                        {question.explanation && (
                          <p className="mt-2 p-2 bg-white rounded">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topics Tab */}
            {activeTab === "topics" && (
              <div>
                <h3 className="text-xl font-bold mb-6">Topic-wise Performance</h3>
                <div className="space-y-4">
                  {topicAnalytics.map((topic) => (
                    <div key={`topic-${topic.topic}`} className="p-4 bg-gray-50 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold">{topic.topic}</p>
                        <span className="text-lg font-bold">
                          {topic.accuracy}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-2 mb-2">
                        {(() => {
                          const getAccuracyColor = () => {
                            if (topic.accuracy >= 70) return "bg-green-500";
                            if (topic.accuracy >= 50) return "bg-yellow-500";
                            return "bg-red-500";
                          };
                          return (
                            <div
                              className={`h-2 rounded-full ${getAccuracyColor()}`}
                              style={{ width: `${topic.accuracy}%` }}
                            ></div>
                          );
                        })()}
                      </div>
                      <p className="text-sm text-gray-600">
                        {topic.correct} out of {topic.total} correct
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === "feedback" && (
              <div>
                <h3 className="text-xl font-bold mb-6">AI-Generated Feedback</h3>
                <div className="space-y-6">
                  {aiFeedback?.strongAreas && aiFeedback.strongAreas.length > 0 && (
                    <div className="p-4 bg-green-50 rounded border border-green-200">
                      <h4 className="font-bold text-green-900 mb-2">
                        💪 Your Strengths
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-green-800">
                        {aiFeedback.strongAreas.map((area) => (
                          <li key={`strength-${area}`}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiFeedback?.weakAreas && aiFeedback.weakAreas.length > 0 && (
                    <div className="p-4 bg-orange-50 rounded border border-orange-200">
                      <h4 className="font-bold text-orange-900 mb-2">
                        📚 Areas for Improvement
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-orange-800">
                        {aiFeedback.weakAreas.map((area) => (
                          <li key={`weakness-${area}`}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiFeedback?.recommendations &&
                    aiFeedback.recommendations.length > 0 && (
                      <div className="p-4 bg-blue-50 rounded border border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-2">
                          💡 Recommendations
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-blue-800">
                          {aiFeedback.recommendations.map((rec) => (
                            <li key={`recommendation-${rec}`}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/exams")}
            className="bg-blue-600 text-white px-8 py-3 rounded font-semibold hover:bg-blue-700"
          >
            Take Another Exam
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gray-600 text-white px-8 py-3 rounded font-semibold hover:bg-gray-700"
          >
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamResults;
