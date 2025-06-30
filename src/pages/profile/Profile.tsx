"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../api/apiService";
import type { User } from "../../types";

import logoo from "../../assets/images/logooo.svg";
import userIcon from "../../assets/images/user.svg";
import left from "../../assets/images/arrow-left.svg";
import userr from "../../assets/images/userr.svg";
import setting from "../../assets/images/setting-2.svg";
import message from "../../assets/images/message-text.svg";
import logoutIconImg from "../../assets/images/logout.svg";
import defaultAvatar from "../../assets/images/profile/default_avatar.png";

interface UpdateProfileData {
  fullName?: string;
  email?: string;
  oldPassword?: string;
  password?: string;
  avatar?: string | null;
}

function Profile() {
  const {
    currentUser,
    setCurrentUser: setAuthCurrentUser,
    isLoading: authLoading,
    logout,
    token,
  } = useAuth();
  const navigate = useNavigate();

  const [editField, setEditField] = useState<"fullName" | "email" | "password" | "avatarUrl" | null>(null);
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName);
      setEmail(currentUser.email);
      setAvatarUrl(currentUser.avatar || "");
    }
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormMessage(null);

    if (!currentUser) {
      setFormMessage({
        type: "error",
        text: "Foydalanuvchi topilmadi. Iltimos qayta kiring.",
      });
      return;
    }

    if (editField === "password") {
      if (!oldPassword) {
        setFormMessage({ type: "error", text: "Eski parolni kiriting." });
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setFormMessage({ type: "error", text: "Yangi parollar mos kelmadi." });
        return;
      }
      if (newPassword.length < 8) {
        setFormMessage({
          type: "error",
          text: "Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak.",
        });
        return;
      }
    }

    const updateData: UpdateProfileData = {};
    if (editField === "fullName" && fullName !== currentUser.fullName) {
      updateData.fullName = fullName;
    }
    if (editField === "email" && email !== currentUser.email) {
      updateData.email = email;
    }
    if (editField === "password" && newPassword) {
      updateData.oldPassword = oldPassword;
      updateData.password = newPassword;
    }
    if (editField === "avatarUrl" && avatarUrl !== (currentUser.avatar || "")) {
      updateData.avatar = avatarUrl;
    }

    if (Object.keys(updateData).length === 0) {
      setFormMessage({
        type: "success",
        text: "Hech qanday o'zgarish kiritilmadi.",
      });
      setEditField(null);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiService.patch<{
        success: boolean;
        data: User;
        error?: string;
      }>("/me", updateData);

      if (response.data.success) {
        setAuthCurrentUser(response.data.data);
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setFormMessage({
          type: "success",
          text: "Ma'lumot muvaffaqiyatli yangilandi!",
        });
        setEditField(null);
      } else {
        setFormMessage({
          type: "error",
          text: response.data.error || "Ma'lumotni yangilashda xatolik.",
        });
      }
    } catch (err: any) {
      console.error("Update profile error:", err);
      const errorText =
        err.response?.data?.error ||
        err.message ||
        "Ma'lumotni yangilashda kutilmagan xatolik.";
      setFormMessage({ type: "error", text: errorText });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditForm = (field: "fullName" | "email" | "password" | "avatarUrl") => {
    setEditField(field);
    setFormMessage(null);
    if (currentUser) {
      setFullName(currentUser.fullName);
      setEmail(currentUser.email);
      setAvatarUrl(currentUser.avatar || "");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  };

  const closeEditForm = () => {
    setEditField(null);
    setFormMessage(null);
    if (currentUser) {
      setFullName(currentUser.fullName);
      setEmail(currentUser.email);
      setAvatarUrl(currentUser.avatar || "");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  };

  if (authLoading && !currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        Yuklanmoqda...
      </div>
    );
  }

  if (!currentUser && !token) {
    return (
      <div className="flex justify-center items-center h-screen">
        Foydalanuvchi topilmadi. Iltimos,{" "}
        <a href="/login" className="underline ml-1">
          kiring
        </a>
        .
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        Foydalanuvchi ma'lumotlari yuklanmadi. Sahifani yangilang yoki qayta
        kiring.
      </div>
    );
  }

  return (
    <section className="profile bg-gray-50 min-h-screen py-5">
      <div className="container max-w-[1200px] w-full mx-auto px-5">
        <nav className="md:flex hidden items-center justify-between py-[18px] mb-5">
          <a className="cursor-pointer" onClick={() => navigate("/")}>
            <img src={logoo || "/placeholder.svg"} alt="Logo" />
          </a>
          <button className="flex justify-center items-center w-11 h-11 rounded-full border-none bg-blue-600 cursor-pointer hover:bg-blue-700">
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
        </nav>
        <nav className="relative md:hidden flex items-center justify-center py-2.5 mb-5">
          <a
            className="absolute top-1/2 left-0 -translate-y-1/2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              className="w-6 h-6"
              src={left || "/placeholder.svg"}
              alt="Back"
            />
          </a>
          <p className="text-center font-semibold">So’zlamalar</p>
        </nav>

        <div className="flex md:flex-row flex-col items-start gap-5">
          <div className="md:flex-col flex w-full md:w-[285px] md:mb-0 mb-10 justify-between md:justify-start md:gap-0 md:pr-5 py-3 rounded-lg">
            {[
              { label: "Profile", icon: userr, action: () => {}, active: true },
              {
                label: "Maqsaddlarim",
                icon: setting,
                action: () => navigate("/my-goals/"),
              },
              {
                label: "Yordam",
                icon: message,
                action: () => navigate("/help"),
              },
              {
                label: "Chiqish",
                icon: logoutIconImg,
                action: handleLogout,
                isLogout: true,
              },
            ].map((item) => (
              <div key={item.label}>
                <div
                  className={`flex items-center gap-3 md:pl-4 px-2 py-3 cursor-pointer hover:bg-gray-100 rounded-md`}
                  onClick={item.action}
                >
                  <img
                    className={`w-6 h-6 hidden md:inline-block`}
                    src={item.icon || "/placeholder.svg"}
                    alt={item.label}
                    style={
                      item.isLogout
                        ? {
                            filter:
                              "invert(32%) sepia(99%) saturate(7492%) hue-rotate(357deg) brightness(97%) contrast(108%)",
                          }
                        : {}
                    }
                  />
                  <p
                    className={`font-manrope text-[16px] ${
                      item.isLogout ? "text-red-600" : ""
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 max-w-[500px] w-full p-6 rounded-lg">
            <img
              className="w-18 h-18 rounded-full mb-4 object-cover"
              src={currentUser.avatar || defaultAvatar}
              alt="User Avatar"
            />
            <p className="text-gray-900 font-manrope font-semibold text-[32px] leading-[120%]">
              {currentUser.fullName}
            </p>
            <p className="text-gray-700 font-manrope text-[16px] leading-[140%] mb-8">
              {currentUser.email}
            </p>
            <p className="text-gray-900 font-manrope font-semibold text-[20px] leading-[130%] mb-5">
              Shaxsiy ma’lumotlar
            </p>

            {formMessage && (
              <div
                className={`p-3 mb-4 rounded-md text-sm ${
                  formMessage.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {formMessage.text}
              </div>
            )}

            {!editField ? (
              <div className="space-y-4">
                {[
                  {
                    label: "Ism",
                    value: currentUser.fullName,
                    editAction: () => openEditForm("fullName"),
                  },
                  {
                    label: "Email",
                    value: currentUser.email,
                    editAction: () => openEditForm("email"),
                  },
                  {
                    label: "Parol",
                    value: "••••••••",
                    editAction: () => openEditForm("password"),
                    editText: "Yangi parol yaratish",
                  },
                  {
                    label: "Avatar",
                    value: currentUser.avatar || "Avatar yo'q",
                    editAction: () => openEditForm("avatarUrl"),
                  },
                ].map((field) => (
                  <div key={field.label} className="pb-4 last:border-b-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-900 font-manrope font-semibold text-[16px] mb-[2px]">
                          {field.label}
                        </p>
                        <p className="text-gray-700 font-manrope text-[14px]">
                          {field.label === "Avatar" ? field.value.slice(0, 20) + "..." : field.value}
                        </p>
                      </div>
                      <button
                        className="border-none hover:text-blue-800 font-manrope font-semibold text-[14px] cursor-pointer"
                        onClick={field.editAction}
                      >
                        {field.editText || "Taxrirlash"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {editField === "fullName" && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        To’liq ism
                      </label>
                      <button
                        type="button"
                        className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
                        onClick={closeEditForm}
                      >
                        Ortga
                      </button>
                    </div>
                    <input
                      className="w-full h-10 rounded-lg border border-gray-300 bg-gray-50 outline-none px-3 mt-1"
                      type="text"
                      name="fullName"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Safarali Turotov"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Bu ism profilingizda ko’rinib turadi.
                    </p>
                  </div>
                )}

                {editField === "email" && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        E-pochta manzili
                      </label>
                      <button
                        type="button"
                        className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
                        onClick={closeEditForm}
                      >
                        Ortga
                      </button>
                    </div>
                    <input
                      className="w-full h-10 rounded-lg border border-gray-300 bg-gray-50 outline-none px-3 mt-1"
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ajdarovasimzon@gmail.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      U tizimga kirish va hisobingizni tiklash uchun ishlatiladi.
                    </p>
                  </div>
                )}

                {editField === "password" && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-gray-700">
                        Parolni o'zgartirish
                      </p>
                      <button
                        type="button"
                        className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
                        onClick={closeEditForm}
                      >
                        Ortga
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                      <div>
                        <label
                          htmlFor="oldPassword"
                          className="block text-xs font-medium text-gray-600"
                        >
                          Eski parol
                        </label>
                        <input
                          className="w-full h-10 rounded-lg border border-gray-300 bg-gray-50 outline-none px-3 mt-1"
                          type="password"
                          id="oldPassword"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="Eski parol"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="newPassword"
                          className="block text-xs font-medium text-gray-600"
                        >
                          Yangi parol
                        </label>
                        <input
                          className="w-full h-10 rounded-lg border border-gray-300 bg-gray-50 outline-none px-3 mt-1"
                          type="password"
                          id="newPassword"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Yangi parol"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="confirmNewPassword"
                          className="block text-xs font-medium text-gray-600"
                        >
                          Parolni qayta kiriting
                        </label>
                        <input
                          className="w-full h-10 rounded-lg border border-gray-300 bg-gray-50 outline-none px-3 mt-1"
                          type="password"
                          id="confirmNewPassword"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Parolni tasdiqlang"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Parol kamida 8 ta belgidan iborat bo'lishi kerak.
                    </p>
                  </div>
                )}

                {editField === "avatarUrl" && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label
                        htmlFor="avatarUrl"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Avatar URL manzili
                      </label>
                      <button
                        type="button"
                        className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
                        onClick={closeEditForm}
                      >
                        Ortga
                      </button>
                    </div>
                    <input
                      className="w-full h-10 rounded-lg border border-gray-300 bg-gray-50 outline-none px-3 mt-1"
                      type="url"
                      id="avatarUrl"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.png"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Profil rasmingiz uchun URL manzilini kiriting.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-auto px-5 py-2.5 h-10 rounded-lg border-none bg-blue-600 text-white cursor-pointer hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
