import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Step3Report = ({ report }) => {
  const navigate = useNavigate();

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading Report...</p>
      </div>
    );
  }

  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

  const questionScoreData = questionWiseScore.map((q, idx) => ({
    name: `Q${idx + 1}`,
    score: typeof q.score === "number" ? q.score : 0,
  }));

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ];

  let performanceText = "";
  let shortTagLine = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities.";
    shortTagLine = "Excellent clarity and structured responses.";
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement before interviews.";
    shortTagLine = "Good foundation, refine articulation.";
  } else {
    performanceText = "Significant improvement required.";
    shortTagLine = "Work on clarity and confidence.";
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;

  return (
    <div className="min-h-screen bg-linear-to-br from-white to-green-50 px-4 sm:px-6 lg:px-12 py-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/history")}
            className="p-3 rounded-full bg-white shadow hover:shadow-lg transition"
          >
            <FaArrowLeft className="text-gray-600" size={18} />
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Interview Analytics Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              AI-powered performance insights
            </p>
          </div>
        </div>

        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg shadow-md transition font-semibold text-sm sm:text-base">
          Download PDF
        </button>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 items-start">
        {/* LEFT SIDE (STICKY) */}
        <div className="space-y-6 lg:sticky lg:top-6 h-fit">
          {/* SCORE CARD */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-6 sm:p-8 text-center"
          >
            <h3 className="text-gray-500 mb-6 text-sm sm:text-base">
              Overall Performance
            </h3>

            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto">
              <CircularProgressbar
                value={percentage}
                text={`${score}/10`}
                styles={buildStyles({
                  textSize: "16px",
                  pathColor: "#10b981",
                  textColor: "#ef4444",
                  trailColor: "#e5e7eb",
                })}
              />
            </div>

            <p className="text-gray-400 mt-3 text-sm">Out of 10</p>

            <div className="mt-4">
              <p className="font-semibold text-gray-800">{performanceText}</p>
              <p className="text-gray-500 text-sm mt-1">{shortTagLine}</p>
            </div>
          </motion.div>

          {/* SKILLS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-6 sm:p-8"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-6">
              Skill Evaluation
            </h3>

            <div className="space-y-5">
              {skills.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2 text-sm">
                    <span>{s.label}</span>
                    <span className="font-semibold text-green-600">
                      {s.value}
                    </span>
                  </div>

                  <div className="bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full"
                      style={{ width: `${s.value * 10}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          {/* CHART */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-5 sm:p-8"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-6">
              Performance Trend
            </h3>

            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={questionScoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Area
                    type="linear"
                    dataKey="score"
                    stroke="#22c55e"
                    fill="#bbf7d0"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* QUESTIONS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-5 sm:p-8"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-6">
              Question Breakdown
            </h3>

            <div className="space-y-6">
              {questionWiseScore.map((q, i) => (
                <div
                  key={i}
                  className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Question {i + 1}</p>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">
                        {q.question || "Question not available"}
                      </p>
                    </div>

                    <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold text-xs sm:text-sm w-fit whitespace-nowrap">
                      {q.score ?? 0} / 10
                    </div>
                  </div>

                  <div className="bg-green-50 border border-gray-200 p-4 rounded-lg">
                    <p className="text-xs text-green-600 font-semibold mb-1">
                      AI Feedback
                    </p>
                    <p className="text-sm text-gray-700">
                      {q.feedback && q.feedback.trim() !== ""
                        ? q.feedback
                        : "No feedback available for this question."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Step3Report;
