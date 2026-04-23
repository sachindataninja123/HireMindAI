import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "motion/react";
import { FaRobot, FaUser } from "react-icons/fa";
import { BsCoin } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { HiOutlineLogout } from "react-icons/hi";
import { ServerURL } from "../App";
import { setUserData } from "../redux/userSlice";
import axios from "axios";
import AuthModel from "./AuthModel";


const Navbar = () => {
  const { userData } = useSelector((state) => state.user);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const disPatch = useDispatch();

  const creditRef = useRef();
  const userRef = useRef();

  const navigate = useNavigate();
  const user = userData?.data || userData;

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (creditRef.current && !creditRef.current.contains(e.target)) {
        setShowCreditPopup(false);
      }

      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogOut = async () => {
    try {
      // console.log(ServerURL);
      await axios.get(ServerURL + "/api/auth/logout", {
        withCredentials: true,
      });
      disPatch(setUserData(null));
      setShowCreditPopup(false);
      setShowUserPopup(false);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="bg-[#f3f3f3] flex justify-center px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex w-full max-w-6xl bg-white rounded-3xl shadow-md border border-gray-200 px-8 py-4 justify-between items-center"
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="bg-black text-white p-2 rounded-lg">
            <FaRobot size={18} />
          </div>
          <h1 className="font-semibold hidden md:block text-lg">HireMindAI</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {/* Credits */}
          <div className="relative" ref={creditRef}>
            <button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }
                setShowCreditPopup(!showCreditPopup);
                setShowUserPopup(false);
              }}
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-md hover:bg-gray-200 transition"
            >
              <BsCoin size={20} />
              {user?.credits ?? 0}
            </button>

            {showCreditPopup && (
              <div className="absolute right-0 mt-3 w-64 bg-white shadow-xl border border-gray-200 rounded-xl p-5 z-50">
                <p className="text-sm text-gray-600 mb-4">
                  Need more credits to continue interviews?
                </p>
                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full bg-black text-white py-2 rounded-lg text-sm hover:opacity-90"
                >
                  Buy more credits
                </button>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }
                setShowUserPopup(!showUserPopup);
                setShowCreditPopup(false);
              }}
              className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold"
            >
              {user?.name ? user.name.slice(0, 1).toUpperCase() : <FaUser />}
            </button>

            {showUserPopup && (
              <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl border border-gray-200 rounded-xl p-4 z-50">
                <p className="text-md text-blue-500 font-medium mb-2">
                  {user?.name || "User"}
                </p>

                <button
                  onClick={() => navigate("/history")}
                  className="w-full text-left text-sm py-2 hover:text-black text-gray-600"
                >
                  Interview History
                </button>

                <button
                  onClick={handleLogOut}
                  className="w-full text-left text-sm py-2 flex items-center gap-2 text-red-500 hover:opacity-80"
                >
                  <HiOutlineLogout size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  );
};

export default Navbar;
