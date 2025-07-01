"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Assuming your image imports are correctly handled by your bundler
import logo from "../../assets/images/Logo (3).svg";
import userIcon from "../../assets/images/user.svg";
import add from "../../assets/images/add.svg";
import menu from "../../assets/images/menu.png";
import notificat from "../../assets/images/notification.svg";
import defaultProfileImage from "../../assets/images/profile.png";
import userr from "../../assets/images/userr.svg";
import setting from "../../assets/images/setting-2.svg";
import message from "../../assets/images/message-text.svg";
import logoutIcon from "../../assets/images/logout.svg";
import defaultAvatar from "../../assets/images/profile/default_avatar.png";
import "./navbar.css";

// Define User type
interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string | null;
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoadingUser(false);
        return;
      }

      try {
        setIsLoadingUser(true);
        const response = await fetch("https://api.maqsaddosh.uz/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCurrentUser(data.data);
          } else {
            localStorage.removeItem("token");
            setCurrentUser(null);
          }
        } else {
          localStorage.removeItem("token");
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setCurrentUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setIsModalOpen(false);
    navigate("/login");
  };

  const goGoal = () => {
    navigate("/add-goal");
  };

  const goToProfile = () => {
    setIsModalOpen(false);
    navigate("/profile");
  };

  const navigateTo = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  const handleOverlayClick = () => {
    setIsModalOpen(false);
  };

  // Define active states for all routes
  const isHomeActive =
    location.pathname === "/" || location.pathname === "/home";
  const isMaqsaddoshActive = location.pathname === "/joined-goals";
  const isAboutActive = location.pathname === "/blog";
  const isHelpActive = location.pathname === "/help";

  return (
    <div className="navbar py-4">
      <div className="relative container flex items-center justify-between max-w-[1200px] w-full mx-auto px-5">
        <button
          className="md:hidden cursor-pointer"
          onClick={() => setIsMenuOpen(true)}
        >
          <img className="" src={menu || "/placeholder.svg"} alt="Menu" />
        </button>

        <div className="left flex items-center gap-5">
          <a
            className="hidden md:flex cursor-pointer"
            onClick={() => navigateTo("/")}
          >
            <img
              className="flex w-10 h-12"
              src={logo || "/placeholder.svg"}
              alt="logo"
            />
          </a>
          <ul className="list md:flex hidden items-center gap-10">
            <li className="item">
              <a
                onClick={() => navigateTo("/")}
                className={`cursor-pointer link font-medium text-base leading-[130%] tracking-[0%] font-manrope ${
                  isHomeActive
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600 active:text-blue-600"
                }`}
              >
                Bosh sahifa
              </a>
            </li>
            <li className="item">
              <a
                onClick={() => navigateTo("/joined-goals")}
                className={`cursor-pointer link font-medium text-base leading-[130%] tracking-[0%] font-manrope ${
                  isMaqsaddoshActive
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600 active:text-blue-600"
                }`}
              >
                Maqsaddosh
              </a>
            </li>
            <li className="item">
              <a
                onClick={() => navigateTo("/blog")}
                className={`cursor-pointer link font-medium text-base leading-[130%] tracking-[0%] font-manrope ${
                  isAboutActive
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600 active:text-blue-600"
                }`}
              >
                Biz haqimizda
              </a>
            </li>
            <li className="item">
              <a
                onClick={() => navigateTo("/help")}
                className={`cursor-pointer link font-medium text-base leading-[130%] tracking-[0%] font-manrope ${
                  isHelpActive
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600 active:text-blue-600"
                }`}
              >
                Yordam
              </a>
            </li>
          </ul>
        </div>

        <div className="right flex items-center gap-2">
          <button
            className="flex justify-center items-center gap-1 md:h-11 h-10 md:w-auto w-10 rounded-[8px] border-[0.5px] border-gray-100 bg-gray-50 px-2 cursor-pointer hover:bg-gray-200 active:bg-gray-100"
            onClick={goGoal}
          >
            <img
              className="w-6 h-6"
              src={add || "/placeholder.svg"}
              alt="add"
            />
            <span className="hidden lg:flex text-gray-800 font-roboto font-normal text-base leading-[140%] tracking-normal">
              Maqsad qo'shish
            </span>
          </button>

          {!currentUser && (
            <button
              className="flex justify-center items-center lg:w-11 lg:h-11 w-10 h-10 rounded-[8px] border-none cursor-pointer hover:opacity-65 active:opacity-50 transition-all duration-300"
              onClick={() => setIsModalOpen((prev) => !prev)}
            >
              <img
                className="w-6 h-6"
                src={userIcon || "/placeholder.svg"}
                alt="User"
              />
            </button>
          )}

          {currentUser ? (
            <button
              className="flex justify-center items-center lg:w-11 lg:h-11 w-10 h-10 rounded-[8px] border-none cursor-pointer hover:opacity-65 active:opacity-50 transition-all duration-300"
              onClick={() => setIsModalOpen((prev) => !prev)}
            >
              {currentUser.avatar ? (
                <img
                  className="w-full h-full rounded-full object-cover"
                  src={currentUser.avatar || "/placeholder.svg"}
                  alt="User Avatar"
                />
              ) : (
                <img
                  className="w-6 h-6"
                  src={userIcon || "/placeholder.svg"}
                  alt="User"
                />
              )}
            </button>
          ) : (
            !isLoadingUser && (
              <button
                onClick={() => navigate("/login")}
                className="flex justify-center items-center lg:w-auto lg:h-11 px-4 h-10 rounded-[8px] border-none bg-blue-600 text-white cursor-pointer hover:bg-blue-400 active:bg-blue300"
              >
                Kirish
              </button>
            )
          )}
        </div>

        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black opacity-10 z-20"
            onClick={handleOverlayClick}
          />
        )}

        {currentUser && (
          <div
            className={`absolute top-20 right-5 z-30 w-[285px] rounded-2xl bg-gray-50 border-[0.5px] border-gray-100 pt-5 transform transition-transform duration-300 ease-in-out z-dropdown bg-bg-000 border-0.5 border-border-300 backdrop-blur-xl min-w-[8rem] overflow-hidden p-1 text-text-300 shadow-diffused shadow-[hsl(var(--always-black)/4%)] max-h-[min(var(--radix-dropdown-menu-content-available-height),var(--dropdown-max-height))] overflow-y-auto mx-2
            ${isModalOpen ? "translate-x-0" : "translate-x-full hidden"}`}
          >
            <div className="flex items-center gap-2 mb-2 pl-2">
              <img
                className="w-10 h-10 rounded-full object-cover"
                src={currentUser.avatar || defaultAvatar}
                alt="Profile"
              />
              <div>
                <p className="text-gray-900 font-manrope font-semibold text-[16px] leading-[130%] tracking-[0%]">
                  {currentUser.fullName}
                </p>
                <p className="text-text-500 pt-1 text-sm pb-2 overflow-ellipsis truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
            <hr className="w-full h-[1px] bg-gray-200 border-none" />
            <div
              className="flex items-center gap-2 pl-4 pt-5 py-2 cursor-pointer hover:bg-gray-100"
              onClick={goToProfile}
            >
              <img
                className="flex w-6 h-6"
                src={userr || "/placeholder.svg"}
                alt="Profile"
              />
              <p className="text-gray-900 font-manrope font-medium text-[16px] leading-[130%] tracking-[0%]">
                Profile
              </p>
            </div>
            <div
              className="flex items-center gap-2 pl-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                setIsModalOpen(false);
                navigateTo("/my-goals");
              }}
            >
              <img
                className="flex w-6 h-6"
                src={setting || "/placeholder.svg"}
                alt="Settings"
              />
              <p className="text-gray-900 font-manrope font-medium text-[16px] leading-[130%] tracking-[0%]">
                Maqsaddlarim
              </p>
            </div>
            <hr className="w-full h-[1px] bg-gray-200 border-none" />
            <div
              className="flex items-center gap-2 pl-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                setIsModalOpen(false);
                navigateTo("/help");
              }}
            >
              <img
                className="flex w-6 h-6"
                src={message || "/placeholder.svg"}
                alt="Help"
              />
              <p className="text-gray-900 font-manrope font-medium text-[16px] leading-[130%] tracking-[0%]">
                Yordam
              </p>
            </div>
            <div
              className="flex items-center gap-2 pl-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={handleLogout}
            >
              <img
                className="flex w-6 h-6"
                src={logoutIcon || "/placeholder.svg"}
                alt="Logout"
              />
              <p className="text-gray-900 font-manrope font-medium text-[16px] leading-[130%] tracking-[0%]">
                Chiqish
              </p>
            </div>
          </div>
        )}
      </div>
      <div
        className={`respons-modal flex flex-col lg:hidden fixed z-30 top-0 left-0 shadow-md h-full bg-white transform transition-transform duration-300 ease-in-out py-6 px-8 gap-3
        ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} `}
      >
        <button
          className="close text-left cursor-pointer pb-4 text-2xl font-bold"
          onClick={() => setIsMenuOpen(false)}
        >
          ×
        </button>
        <a
          onClick={() => navigateTo("/")}
          className={`cursor-pointer link font-medium text-base leading-[130%] tracking-[0%] font-manrope ${
            isHomeActive
              ? "text-blue-600"
              : "text-gray-600 hover:text-blue-600 active:text-blue-600"
          }`}
        >
          Bosh sahifa
        </a>
        <a
          onClick={() => navigateTo("/joined-goals")}
          className={`cursor-pointer link font-medium text-base leading-[130%] tracking-[0%] font-manrope ${
            isMaqsaddoshActive
              ? "text-blue-600"
              : "text-gray-600 hover:text-blue-600 active:text-blue-600"
          }`}
        >
          Maqsaddosh
        </a>
        <a
          onClick={() => navigateTo("/blog")}
          className={`cursor-pointer link font-medium text-base leading-[130%] tracking-[0%] font-manrope ${
            isAboutActive
              ? "text-blue-600"
              : "text-gray-600 hover:text-blue-600 active:text-blue-600"
          }`}
        >
          Biz haqimizda
        </a>
        <a
          onClick={() => navigateTo("/help")}
          className={`cursor-pointer link font-medium text-base leading-[130%] tracking-[0%] font-manrope ${
            isHelpActive
              ? "text-blue-600"
              : "text-gray-600 hover:text-blue-600 active:text-blue-600"
          }`}
        >
          Yordam
        </a>
        {currentUser && (
          <a
            onClick={handleLogout}
            className="cursor-pointer link font-medium text-base leading-[130%] tracking-[0%] font-manrope text-red-600 hover:text-red-800 active:text-red-700 mt-4"
          >
            Chiqish
          </a>
        )}
      </div>
    </div>
  );
}

export default Navbar;
