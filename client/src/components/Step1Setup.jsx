import React from "react";
import { motion } from "motion/react";
import { FaBriefcase } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa";
import { FaFileUpload } from "react-icons/fa";
import { FaMicrophone } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa";

const Step1Setup = ({ onStart }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 px-4"
    >
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden">
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="relative bg-linear-to-br from-green-50 to-green-100 p-12 flex flex-col justify-center"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Start Your AI Interview
          </h2>

          <p className="text-gray-600 mb-10">
            Pracice real interview scenerios powered by AI. Improve
            communication, technical skills, and confidence.
          </p>

          <div className="space-y-5">
            {[
              {
                icon: <FaUserTie className="text-gray-600 text-xl" />,
                text: "Choose Role & Experience",
              },
              {
                icon: <FaMicrophone className="text-gray-600 text-xl" />,
                text: "Smart Voice Interview",
              },
              {
                icon: <FaChartLine className="text-gray-600 text-xl" />,
                text: "Performance Analytics",
              },
            ].map((item, idx) => {
              return (
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + idx * 0.15 }}
                  whileHover={{ scale: 1.03 }}
                  key={idx}
                  className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm cursor-pointer"
                >
                  {item.icon}
                  <span className="text-gray-700 font-medium">{item.text}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div></motion.div>
      </div>
    </motion.div>
  );
};

export default Step1Setup;
