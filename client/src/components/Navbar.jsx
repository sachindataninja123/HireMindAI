import React from "react";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import { FaRobot, FaUser } from "react-icons/fa";
import { BsCoin } from "react-icons/bs";
import { useState } from "react";

const Navbar = () => {
  const { userData } = useSelector((state) => state.user);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, showSetUserPopup] = useState(false);

  const user = userData?.data || userData;

  return (
    <div className="bg-[#f3f3f3] flex justify-center px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex w-full max-w-6xl bg-white rounded-3xl shadow-md border border-gray-200 px-8 py-4 justify-between items-center"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="bg-black text-white p-2 rounded-lg">
            <FaRobot size={18} />
          </div>
          <h1 className="font-semibold  hidden md:block text-lg ">
            HireMindAI
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {/* Credits */}
          <button className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-md hover:bg-gray-200 transition" onClick={() => setShowCreditPopup

          }>
            <BsCoin size={20} />
            {user?.credits ?? 0}
          </button>

          {/* Profile */}
          <button className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold">
            {user?.name ? user.name.slice(0, 1).toUpperCase() : <FaUser />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Navbar;
