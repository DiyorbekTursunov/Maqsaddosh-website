import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import apiService from "../../api/apiService";
import defaultAvatar from "../../assets/images/profile/default_avatar.png";
import { loadImage } from "../../utils/imageCache";

interface Goal {
  id: string;
  name: string;
  description: string;
  duration: number;
  startDate: string;
  endDate: string;
  creator: {
    fullName: string;
    avatar?: string;
  };
  participants: {
    user: {
      id: string;
      avatar: string;
    };
  }[];
}

const MaqsaddoshSocialFeed: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});

  // Function to calculate days remaining
  const calculateDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const today = new Date();
    if (isNaN(end.getTime())) {
      console.warn(`Invalid endDate: ${endDate}`);
      return 0;
    }
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / 86400000);
  };

  // Fetch joined goals from backend
  useEffect(() => {
    const fetchJoinedGoals = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }
        const response = await apiService.get("/goals/joined", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("API Response:", response.data);
        setGoals(response.data.data || []);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching joined goals:", err.message);
        setError(err.message || "Failed to load joined goals");
        setLoading(false);
      }
    };

    fetchJoinedGoals();
  }, []);

  // Preload images when goals change
  useEffect(() => {
    const preloadImages = async () => {
      const newImageUrls: { [key: string]: string } = {};
      const imagePromises: Promise<void>[] = [];

      for (const goal of goals) {
        if (goal.creator.avatar) {
          imagePromises.push(
            loadImage(goal.creator.avatar, defaultAvatar).then((url) => {
              if (goal.creator.avatar) {
                newImageUrls[goal.creator.avatar] = url;
              }
            })
          );
        }
        for (const participant of goal.participants) {
          if (participant.user.avatar) {
            imagePromises.push(
              loadImage(participant.user.avatar, defaultAvatar).then((url) => {
                newImageUrls[participant.user.avatar] = url;
              })
            );
          }
        }
      }

      await Promise.all(imagePromises);
      setImageUrls(newImageUrls);
    };

    preloadImages();
  }, [goals]);

  const handleButtonClick = (buttonText: string, goalId: string) => {
    console.log("Button clicked:", buttonText, "Goal ID:", goalId);
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center py-16">
        <span className="text-gray-600 text-lg">Loading...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="text-gray-900 min-h-screen">
      <div className="max-w-[1200px] mx-auto bg-white min-h-screen">
        {/* Header */}
        <Navbar />

        {/* Main Content */}
        <main className="px-6 py-8">
          <div className="max-w-[995px] mx-auto space-y-8">
            {goals.length === 0 ? (
              <p className="text-center text-gray-600">
                Siz hali hech qanday maqsadlarga qoʻshilmagansiz.
              </p>
            ) : (
              goals
                .filter((goal) => goal && goal.id)
                .map((goal) => (
                  <article
                    key={goal.id}
                    className="bg-gray-50 border-gray-100 border-2 rounded-2xl pt-4 pl-5 pb-4 pr-5 mb-4"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        loading="lazy"
                        src={
                          imageUrls[goal.creator.avatar || defaultAvatar] ||
                          defaultAvatar
                        }
                        alt={goal.creator.fullName}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => (e.currentTarget.src = defaultAvatar)}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-base">
                          {goal.creator.fullName}
                        </h3>
                      </div>
                    </div>

                    <div className="mb-2.5">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        {goal.name}
                      </h2>
                      <p className="text-gray-700 text-base leading-relaxed">
                        {goal.description}
                      </p>
                    </div>

                    <div className="w-33 h-9 rounded-full bg-gray-100 flex justify-center items-center gap-1 mb-2.5 text-gray-500 text-sm">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4.29167 1.6665V18.3332"
                          stroke="#4A4E5A"
                          stroke-width="1.5"
                          stroke-miterlimit="10"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M4.29167 3.3335H13.625C15.875 3.3335 16.375 4.5835 14.7917 6.16683L13.7917 7.16683C13.125 7.8335 13.125 8.91683 13.7917 9.50016L14.7917 10.5002C16.375 12.0835 15.7917 13.3335 13.625 13.3335H4.29167"
                          stroke="#4A4E5A"
                          stroke-width="1.5"
                          stroke-miterlimit="10"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      <span className="text-base font-semibold">
                        {calculateDaysRemaining(goal.endDate)} kun qoldi
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        className="w-34.5 h-9 flex gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                        onClick={() => handleButtonClick("Maqsaddosh", goal.id)}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5.375 1.6665V18.3332"
                            stroke="#F7F8F8"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M5.79166 3.3335L12.5417 6.25016C15.2917 7.41683 15.2917 9.41683 12.7083 10.7502L5.79166 14.1668"
                            stroke="#F7F8F8"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Maqsaddosh
                      </button>

                      <div className="w-32.5 h-9 flex items-center space-x-2 border border-blue-500 rounded-full px-3 py-1.5">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.9167 15.8168H6.08335C5.73335 15.8168 5.34168 15.5418 5.22501 15.2085L1.77501 5.55846C1.28335 4.17513 1.85835 3.75013 3.04168 4.60013L6.29168 6.92513C6.83335 7.30013 7.45001 7.10846 7.68335 6.50013L9.15001 2.5918C9.61668 1.3418 10.3917 1.3418 10.8583 2.5918L12.325 6.50013C12.5583 7.10846 13.175 7.30013 13.7083 6.92513L16.7583 4.75013C18.0583 3.8168 18.6833 4.2918 18.15 5.80013L14.7833 15.2251C14.6583 15.5418 14.2667 15.8168 13.9167 15.8168Z"
                            stroke="#40444C"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M5.41666 18.3335H14.5833"
                            stroke="#40444C"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M7.91666 11.6665H12.0833"
                            stroke="#40444C"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="text-gray-700 text-sm font-medium">
                          +{goal.participants.length}
                        </span>
                        <div className="flex -space-x-2">
                          {goal.participants
                            .slice(0, 3)
                            .map((participant, index) => (
                              <img
                                key={index}
                                loading="lazy"
                                className="w-6 h-6 rounded-full border-2 border-white"
                                src={
                                  imageUrls[
                                    participant.user.avatar || defaultAvatar
                                  ] || defaultAvatar
                                }
                                alt="Participant"
                                onError={(e) =>
                                  (e.currentTarget.src = defaultAvatar)
                                }
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                  </article>
                ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MaqsaddoshSocialFeed;
