import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import apiService from "../../api/apiService";
import type { SubDirection } from "../../types";
import Navbar from "../../components/navbar/Navbar";
import Hero from "../../components/hero/Hero";
import Cart from "../../components/cart/Cart"; // Add this
import eduIcon from "../../assets/images/teacher.svg";
import { ChevronLeft } from "lucide-react"

// Interface for frontend category styling
interface CategoryStyle {
  icon: string;
  bgColor: string;
  iconColor: string;
}

function Edu() {
  const { directionsId } = useParams<{ directionsId: string }>();
  const [direction, setDirection] = useState<SubDirection[] | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const parentStyle = location.state?.style as CategoryStyle | undefined;

  useEffect(() => {
    if (!directionsId) {
      setError("Yo'nalish ID topilmadi.");
      setIsLoading(false);
      return;
    }
    const fetchDirectionDetails = async () => {
      setIsLoading(true);
      setError("");
      try {
        // This endpoint should return the direction with its subDirections
        const response = await apiService.get<{
          success: boolean;
          data: SubDirection[];
        }>(
          `/directions/${directionsId}` // Assuming this endpoint returns direction name and its subdirections
        );
        if (response.data.success) {
          setDirection(response.data.data);
        } else {
          setError(response.data.error || "Yo'nalish ma'lumotlari yuklanmadi");
        }
      } catch (err: any) {
        console.error("Direction details error:", err);
        setError(
          err.response?.data?.error || "Yo'nalish ma'lumotlari yuklanmadi"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchDirectionDetails();
  }, [directionsId]);

  const handleSubdirectionClick = (subdirectionId: string) => {
    navigate(`/goals?subdirectionId=${subdirectionId}`);
  };

  const handleBackClick = () => {
    // Navigate back to the parent direction page if possible, or just history back
    // Example: navigate(`/edu/${parentDirectionId}`) if you have it
    navigate(-1);
  };

  return (
    <>
      <Navbar />
      <Hero />
      <section className="edu py-10">
        <div className="container max-w-6xl w-full mx-auto px-5">
          {isLoading && (
            <p className="text-center text-gray-600">Yuklanmoqda...</p>
          )}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          {direction && !isLoading && !error && (
            <>
              <button
                className="cursor-pointer flex md:text-[20px] text-lg leading-[130%] tracking-[0%] font-manrope text-gray-900 mb-5"
                onClick={handleBackClick}
              >
                <ChevronLeft className="text-gray-500" />
                Maqsad yo’nalishlari
              </button>
              {direction && direction.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full pb-10">
                  {direction.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => handleSubdirectionClick(sub.id)}
                      className="cursor-pointer"
                    >
                      <Cart
                        title={sub.name}
                        icon={parentStyle?.icon || eduIcon}
                        bgColor={parentStyle?.bgColor || "bg-[#DBDFFC]"}
                        iconColor={parentStyle?.iconColor || "bg-[#7182FE]"}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-700 text-center">
                  Bu yo'nalishda ichki bo'limlar mavjud emas.
                </p>
              )}
            </>
          )}
          {!direction && !isLoading && !error && (
            <p className="text-gray-700 text-center">Yo'nalish topilmadi.</p>
          )}
        </div>
      </section>
    </>
  );
}

export default Edu;
