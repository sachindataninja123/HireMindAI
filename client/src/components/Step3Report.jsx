import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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

  const questionScoreData = questionWiseScore.map((score, idx) => ({
    name: `Q${idx + 1}`,
    score: score.score || 0,
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
    shortTagLine = "Good foundation , refine aticulation";
  } else {
    performanceText = "Significant improvement required.";
    shortTagLine = "work on clarity and confidence";
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-green-50 px-4 sm:px-6 lg:px-10 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/history")}
            className="p-3 rounded-full bg-white shadow hover:shadow-lg transition"
          >
            <FaArrowLeft className="text-gray-600" size={18} />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Interview Analytics Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              AI-powered performance insights
            </p>
          </div>
        </div>


        <button className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl shadow-md transition-all duration-300 font-semibold text-sm sm:text-base">
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default Step3Report;
