"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../../api/apiService";
import type { Goal, SubDirection } from "../../types";
import {
  ChevronLeft,
  Flag,
  ClipboardCheck,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import Navbar from "../../components/navbar/Navbar";
import defaultAvatar from "../../assets/images/profile/default_avatar.png"; // Default avatar

const calculateDaysLeft = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diffInMs = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffInMs / (1000 * 60 * 60 * 24)));
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700";
    case "COMPLETED":
      return "bg-blue-100 text-blue-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "Faol";
    case "COMPLETED":
      return "Yakunlangan";
    case "CANCELLED":
      return "Bekor qilingan";
    default:
      return status;
  }
};

function MyGoals() {
  const navigate = useNavigate();
  const location = useLocation();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [subdirectionName, setSubdirectionName] =
    useState("Mening Maqsadlarim");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    const subdirectionId = new URLSearchParams(location.search).get(
      "subdirectionId"
    );

    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        // If subdirectionId is provided, fetch subdirection name
        if (subdirectionId) {
          try {
            const subDirResponse = await apiService.get<{
              success: boolean;
              data: SubDirection;
            }>(`/subdirections/${subdirectionId}`);
            if (subDirResponse.data.success) {
              setSubdirectionName(
                `${subDirResponse.data.data.name} - Mening Maqsadlarim`
              );
            }
          } catch (subDirErr) {
            console.warn("Could not fetch subdirection name:", subDirErr);
          }
        }

        // Fetch user's own goals using the /goals/my endpoint
        const goalsResponse = await apiService.get<{
          success: boolean;
          data: Goal[];
        }>(
          `/goals/my${subdirectionId ? `?subDirection=${subdirectionId}` : ""}`
        );

        if (goalsResponse.data.success) {
          setGoals(goalsResponse.data.data);
          setFilteredGoals(goalsResponse.data.data);
        } else {
          setError(goalsResponse.data.error || "Maqsadlar yuklanmadi");
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.error || "Ma'lumotlar yuklanmadi");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [location]);

  // Filter goals based on status
  useEffect(() => {
    if (activeFilter === "ALL") {
      setFilteredGoals(goals);
    } else {
      setFilteredGoals(goals.filter((goal) => goal.status === activeFilter));
    }
  }, [goals, activeFilter]);

  const handleGoalClick = (goalId: string) => {
    const subdirectionId = new URLSearchParams(location.search).get(
      "subdirectionId"
    );
    navigate(
      `/goals/${goalId}${
        subdirectionId ? `?subdirectionId=${subdirectionId}` : ""
      }`
    );
  };

  const handleEditGoal = (e: React.MouseEvent, goalId: string) => {
    e.stopPropagation();
    navigate(`/goals/edit/${goalId}`);
  };

  const handleDeleteGoal = async (e: React.MouseEvent, goalId: string) => {
    e.stopPropagation();
    if (window.confirm("Bu maqsadni o'chirishga ishonchingiz komilmi?")) {
      try {
        const response = await apiService.delete(`/goals/${goalId}`);
        if (response.data.success) {
          setGoals(goals.filter((goal) => goal.id !== goalId));
          // Show success message (you can replace this with a toast notification)
          alert("Maqsad muvaffaqiyatli o'chirildi");
        }
      } catch (err: any) {
        console.error("Error deleting goal:", err);
        alert(
          err.response?.data?.error || "Maqsadni o'chirishda xatolik yuz berdi"
        );
      }
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const filterButtons = [
    { key: "ALL", label: "Barchasi", count: goals.length },
    {
      key: "ACTIVE",
      label: "Faol",
      count: goals.filter((g) => g.status === "ACTIVE").length,
    },
    {
      key: "COMPLETED",
      label: "Yakunlangan",
      count: goals.filter((g) => g.status === "COMPLETED").length,
    },
    {
      key: "CANCELLED",
      label: "Bekor qilingan",
      count: goals.filter((g) => g.status === "CANCELLED").length,
    },
  ];

  return (
    <div className="font-sans min-h-screen bg-[#FBFBFB]">
      <Navbar />
      <div className="max-w-[1058px] mx-auto px-5 py-6">
        <div className="flex items-center justify-between text-[20px] font-semibold mb-5">
          <button
            className="cursor-pointer flex items-center gap-2 text-gray-700 hover:text-gray-500 transition-all duration-300"
            onClick={handleBackClick}
          >
            <ChevronLeft className="text-gray-500" />
            <span>{subdirectionName}</span>
          </button>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterButtons.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter.key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {isLoading && (
          <p className="text-gray-600 text-center">Maqsadlar yuklanmoqda...</p>
        )}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {!isLoading && !error && filteredGoals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-700 mb-4">
              {activeFilter === "ALL"
                ? "Hali maqsadlaringiz yo'q."
                : `${getStatusText(activeFilter)} maqsadlar topilmadi.`}
            </p>
          </div>
        )}

        {!isLoading && !error && filteredGoals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGoals.map((goal) => (
              <div
                key={goal.id}
                className="rounded-[20px] bg-white shadow-sm cursor-pointer hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 relative group"
                onClick={() => handleGoalClick(goal.id)}
              >
                {/* Action buttons */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  <button
                    onClick={(e) => handleDeleteGoal(e, goal.id)}
                    className="cursor-pointer p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={goal.creator.avatar || defaultAvatar}
                        alt={goal.creator.fullName}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <span className="text-[16px] text-gray-700 truncate">
                        {goal.creator.fullName}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 text-[19px] leading-tight mb-2.5 min-h-[40px] line-clamp-2">
                    {goal.name}
                  </h3>

                  <div className="flex items-center text-[14px] text-gray-600 bg-gray-100 w-fit rounded-full mb-3 gap-1 py-1 px-3">
                    <Flag className="w-4 h-4 text-gray-500" />
                    <span>
                      {goal.status === "COMPLETED"
                        ? "Yakunlangan"
                        : goal.status === "CANCELLED"
                        ? "Bekor qilingan"
                        : `${calculateDaysLeft(goal.endDate)} kun qoldi`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-gray-100 rounded-full gap-1 py-1.5 px-2.5">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          goal.status
                        )}`}
                      >
                        {getStatusText(goal.status)}
                      </span>

                      <ClipboardCheck className="w-4 h-4 text-gray-500" />
                      <span className="text-[14px] text-gray-600">
                        +{goal.participants.length}
                      </span>
                      <div className="flex -space-x-2 ml-1">
                        {goal.participants.slice(0, 3).map((p, index) => (
                          <img
                            key={p.userId + index}
                            src={(p as any).avatar || defaultAvatar}
                            alt="participant"
                            className="w-5 h-5 rounded-full border-2 border-white object-cover"
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      aria-label="Maqsadga o'tish"
                      className="flex items-center justify-center bg-blue-600 w-10 h-10 rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <ArrowRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyGoals;
