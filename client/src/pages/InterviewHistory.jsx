import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerURL } from "../App";
import { FaArrowLeft } from "react-icons/fa";

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const [filter, setFilter] = useState("all"); // 🔥 filter state
  const navigate = useNavigate();

  useEffect(() => {
    const getMyInterviews = async () => {
      try {
        const result = await axios.get(
          ServerURL + "/api/interview/get-interview",
          { withCredentials: true },
        );
        setInterviews(result.data);
      } catch (err) {
        console.log(err);
      }
    };

    getMyInterviews();
  }, []);

  // 🔥 filter logic
  const filteredInterviews = interviews.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-emerald-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-3 rounded-full bg-white shadow hover:shadow-lg transition"
          >
            <FaArrowLeft className="text-gray-600" size={18} />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Interview History
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Review your past interviews and track your progress
            </p>
          </div>
        </div>

        {/* FILTER BUTTONS */}
        <div className="flex gap-3 mb-6">
          {["all", "completed", "Incompleted"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === type
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-white text-gray-600 border hover:bg-gray-100"
              }`}
            >
              {type === "all"
                ? "All"
                : type === "completed"
                  ? "Completed"
                  : "Incomplete"}
            </button>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredInterviews.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow text-center border border-gray-200">
            <p className="text-gray-500 text-lg">
              No interviews found for this filter.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredInterviews.map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/report/${item._id}`)}
                className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* LEFT */}
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                      {item.role}
                    </h3>

                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                      {item.experience} • {item.mode}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6">
                    {/* SCORE */}
                    <div className="text-left md:text-right">
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600">
                        {item.finalScore || 0}
                        <span className="text-xs sm:text-sm text-gray-400">
                          {" "}
                          / 10
                        </span>
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        Overall Score
                      </p>
                    </div>

                    {/* STATUS */}
                    <span
                      className={`px-3 sm:px-4 py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                        item.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewHistory;
