import { useState, useEffect, useCallback, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import type { Direction, SubDirection } from "../../types";
import Navbar from "../../components/navbar/Navbar";
import { ChevronDown } from "lucide-react";

// Types
interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

interface GoalFormData {
  name: string;
  description: string;
  directionId: string;
  subDirectionId: string | null;
  duration: number;
  visibility: "PUBLIC" | "PRIVATE";
  phone: string;
  telegram: string;
  endDate: string;
}

type VisibilityKey = "public" | "private";
type VisibilityValue = "PUBLIC" | "PRIVATE";
type PeriodOption = "7" | "14" | "21" | "28";

// Constants
const VISIBILITY_MAP: Record<VisibilityKey, VisibilityValue> = {
  public: "PUBLIC",
  private: "PRIVATE",
} as const;

const VISIBILITY_DISPLAY_MAP: Record<VisibilityValue, string> = {
  PUBLIC: "Ommaviy (Barchaga ko'rinsin)",
  PRIVATE: "Shaxsiy (Faqat menga ko'rinsin)",
} as const;

const PERIOD_OPTIONS: readonly PeriodOption[] = ["7", "14", "21", "28"] as const;

const INPUT_BASE_CLASS =
  "w-full h-14 px-5 py-3.5 bg-slate-100 rounded-xl text-slate-800 placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow";

// Custom hooks
const useDirections = () => {
  const [directions, setDirections] = useState<Direction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDirections = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.get<ApiResponse<Direction[]>>("/directions");
        setDirections(response.data.data);
      } catch (err) {
        console.error("Yo'nalishlar yuklanmadi", err);
        setError("Yo'nalishlarni yuklashda xatolik yuz berdi");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDirections();
  }, []);

  return { directions, isLoading, error };
};

const useSubDirections = (selectedDirection: string) => {
  const [subDirections, setSubDirections] = useState<SubDirection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!selectedDirection) {
      setSubDirections([]);
      setMessage("");
      return;
    }

    const fetchSubDirections = async () => {
      setIsLoading(true);
      setSubDirections([]);
      setMessage("");

      try {
        const response = await apiService.get<ApiResponse<SubDirection[]>>(
          `/directions/${selectedDirection}`
        );

        if (response.data.success) {
          if (response.data.data && response.data.data.length > 0) {
            setSubDirections(response.data.data);
          } else {
            setMessage("Bu yo'nalish uchun ichki bo'limlar mavjud emas.");
          }
        } else {
          const errorMsg = response.data.error || "Ichki yo'nalishlar ma'lumotlari noto'g'ri.";
          setMessage("Ichki yo'nalishlarni yuklashda xatolik: " + errorMsg);
        }
      } catch (err) {
        console.error("Ichki yo'nalishlar yuklashda xatolik:", err);
        setMessage("Ichki yo'nalishlarni yuklashda server xatoligi yuz berdi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubDirections();
  }, [selectedDirection]);

  return { subDirections, isLoading, message };
};

// Utility functions
const calculateEndDate = (durationInDays: number): string => {
  const currentDate = new Date();
  const endDate = new Date(currentDate);
  endDate.setDate(currentDate.getDate() + durationInDays);
  endDate.setHours(23, 59, 59, 999);
  return endDate.toISOString();
};

// Optional: Normalize phone number to a consistent format
// const normalizePhoneNumber = (phone: string): string => {
//   // Remove all spaces and dashes, ensure +998 prefix
//   const digits = phone.replace(/[\s-]/g, "");
//   return digits.startsWith("+998") || digits.startsWith("998")
//     ? digits
//     : `+998${digits}`;
// };

const validateForm = (
  formData: Omit<GoalFormData, "endDate"> & { selectedPeriod: PeriodOption | null },
  hasSubDirections: boolean
): boolean => {
  const { name, directionId, subDirectionId, selectedPeriod, visibility, phone, telegram } = formData;

  // Phone number validation: accepts +998 XX XXX XXXX, +998XXXXXXXXX, +998-XX-XXX-XXXX,
  // 998 XX XXX XXXX, 998XXXXXXXXX, 998-XX-XXX-XXXX, XX XXX XXXX, XXXXXXXXX, XX-XXX-XXXX
  const phoneRegex = /^(?:(?:\+998|998)?(?:[\s-]?(\d{2})[\s-]?(\d{3})[\s-]?(\d{4})|\d{9}))$/;
  if (!phoneRegex.test(phone)) {
    return false; // Invalid phone number
  }

  // Telegram username validation: must start with @, followed by 5-32 alphanumeric or underscore
  const telegramRegex = /^@[A-Za-z0-9_]{5,32}$/;
  if (!telegramRegex.test(telegram)) {
    return false; // Invalid Telegram username
  }

  return !!(
    name.trim() &&
    directionId &&
    (!hasSubDirections || subDirectionId) &&
    selectedPeriod &&
    visibility &&
    phone.trim() &&
    telegram.trim()
  );
};

// Main component
export default function AddGoal(): JSX.Element {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    telegram: "",
  });
  const [formErrors, setFormErrors] = useState({
    phone: "",
    telegram: "",
  });
  const [selectedDirection, setSelectedDirection] = useState("");
  const [selectedSubDirection, setSelectedSubDirection] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption | null>(null);
  const [visibility, setVisibility] = useState<VisibilityKey | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom hooks
  const { directions, isLoading: isLoadingDirections, error: directionsError } = useDirections();
  const { subDirections, isLoading: isLoadingSubDirections, message: subDirectionsMessage } =
    useSubDirections(selectedDirection);

  // Handlers
  const handleInputChange = useCallback(
    (field: keyof typeof formData) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Validate phone
      if (field === "phone") {
        const phoneRegex = /^(?:(?:\+998|998)?(?:[\s-]?(\d{2})[\s-]?(\d{3})[\s-]?(\d{4})|\d{9}))$/;
        setFormErrors((prev) => ({
          ...prev,
          phone: value && !phoneRegex.test(value)
            ? "Telefon raqamini to'liq kiriting."
            : "",
        }));
      }

      // Validate Telegram
      if (field === "telegram") {
        const telegramRegex = /^@[A-Za-z0-9_]{5,32}$/;
        setFormErrors((prev) => ({
          ...prev,
          telegram: value && !telegramRegex.test(value)
            ? "Telegram username @ bilan boshlanishi va 5-32 ta harf, raqam yoki pastki chiziqdan iborat bo'lishi kerak"
            : "",
        }));
      }
    },
    []
  );

  const handleDirectionChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedDirection(e.target.value);
    setSelectedSubDirection(""); // Reset sub-direction when direction changes
  }, []);

  const handleSubDirectionChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubDirection(e.target.value);
  }, []);

  const handleVisibilityChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setVisibility(e.target.value as VisibilityKey);
  }, []);

  const handlePeriodSelect = useCallback((period: PeriodOption) => {
    setSelectedPeriod(period);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formValidationData = {
      ...formData,
      directionId: selectedDirection,
      subDirectionId: selectedSubDirection,
      selectedPeriod,
      visibility,
    };

    if (!validateForm(formValidationData, subDirections.length > 0)) {
      alert("Iltimos, barcha maydonlarni to'g'ri to'ldiring!");
      return;
    }

    if (formErrors.phone || formErrors.telegram) {
      alert("Iltimos, telefon raqami yoki Telegram username xatolarini tuzating!");
      return;
    }

    if (!selectedPeriod || !visibility) return;

    setIsSubmitting(true);

    try {
      const duration = parseInt(selectedPeriod, 10);
      const goalData: GoalFormData = {
        name: formData.name,
        description: formData.description,
        directionId: selectedDirection,
        subDirectionId: selectedSubDirection || null,
        duration,
        visibility: VISIBILITY_MAP[visibility],
        phone: formData.phone, // Optionally use: normalizePhoneNumber(formData.phone)
        telegram: formData.telegram,
        endDate: calculateEndDate(duration),
      };

      await apiService.post<ApiResponse<unknown>>("/goals", goalData);
      navigate("/my-goals");
    } catch (err) {
      console.error("Maqsad saqlanmadi: Xatolik yuz berdi", err);
      alert("Maqsad saqlanmadi: Xatolik yuz berdi. Tafsilotlar uchun konsolni tekshiring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Computed values
  const isFormDisabled = isLoadingDirections || isLoadingSubDirections;
  const isSubmitDisabled = isSubmitting || isFormDisabled;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto max-w-lg px-4 py-8 sm:py-12">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">
            Maqsad qo'shish
          </h2>

          {directionsError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {directionsError}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name Input */}
            <input
              type="text"
              placeholder="Maqsad nomi"
              value={formData.name}
              onChange={handleInputChange("name")}
              required
              minLength={3}
              className={INPUT_BASE_CLASS}
              disabled={isFormDisabled}
            />

            {/* Description Textarea */}
            <textarea
              placeholder="Izoh qoldirish"
              required
              rows={3}
              value={formData.description}
              onChange={handleInputChange("description")}
              className={`${INPUT_BASE_CLASS} resize-none leading-relaxed`}
              disabled={isFormDisabled}
            />

            {/* Direction Select */}
            <div className="relative">
              <select
                value={selectedDirection}
                onChange={handleDirectionChange}
                required
                disabled={isFormDisabled}
                className={`${INPUT_BASE_CLASS} appearance-none pr-10 cursor-pointer ${
                  selectedDirection ? "text-slate-800" : "text-slate-500"
                }`}
              >
                <option value="" disabled className="text-slate-500">
                  {isLoadingDirections ? "Yuklanmoqda..." : "Yo'nalish tanlang"}
                </option>
                {directions.map((dir) => (
                  <option key={dir.id} value={dir.id} className="text-slate-800">
                    {dir.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sub Direction Select */}
            <div className="relative">
              <select
                value={selectedSubDirection}
                onChange={handleSubDirectionChange}
                required={subDirections.length > 0}
                disabled={isFormDisabled || !selectedDirection || subDirections.length === 0}
                className={`${INPUT_BASE_CLASS} appearance-none pr-10 cursor-pointer ${
                  selectedSubDirection ? "text-slate-800" : "text-slate-500"
                }`}
              >
                <option value="" disabled className="text-slate-500">
                  {isLoadingSubDirections ? "Yuklanmoqda..." : "Ichki yo'nalish tanlang"}
                </option>
                {subDirections.map((sub) => (
                  <option key={sub.id} value={sub.id} className="text-slate-800">
                    {sub.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sub Directions Message */}
            {!isLoadingSubDirections && subDirectionsMessage && (
              <p
                className={`text-sm mt-1 ${
                  subDirectionsMessage.includes("xatolik") ? "text-red-500" : "text-gray-600"
                }`}
              >
                {subDirectionsMessage}
              </p>
            )}

            {/* Period Selection */}
            <div>
              <div className="grid grid-cols-4 gap-3">
                {PERIOD_OPTIONS.map((days) => (
                  <button
                    key={days}
                    type="button"
                    className={`h-14 text-base w-full rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
                      selectedPeriod === days
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    onClick={() => handlePeriodSelect(days)}
                    disabled={isFormDisabled}
                  >
                    {days} kun
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility Select */}
            <div className="relative">
              <select
                value={visibility}
                onChange={handleVisibilityChange}
                required
                disabled={isFormDisabled}
                className={`${INPUT_BASE_CLASS} appearance-none pr-10 cursor-pointer ${
                  visibility ? "text-slate-800" : "text-slate-500"
                }`}
              >
                <option value="" disabled className="text-slate-500">
                  Ommaviylik
                </option>
                <option value="public" className="text-slate-800">
                  {VISIBILITY_DISPLAY_MAP.PUBLIC}
                </option>
                <option value="private" className="text-slate-800">
                  {VISIBILITY_DISPLAY_MAP.PRIVATE}
                </option>
              </select>
              <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Phone Input */}
            <div className="relative">
              <input
                type="tel"
                placeholder="Telefon raqam kiriting"
                value={formData.phone}
                onChange={handleInputChange("phone")}
                required
                pattern="(?:(?:\+998|998)?(?:[ -]?[0-9]{2}[ -]?[0-9]{3}[ -]?[0-9]{4}|[0-9]{9}))"
                title="Telefon raqam nog'ri"
                className={`${INPUT_BASE_CLASS} ${formErrors.phone ? "border-red-500" : ""}`}
                disabled={isFormDisabled}
              />
              {formErrors.phone && (
                <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>
              )}
            </div>

            {/* Telegram Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Telegram user kiriting"
                value={formData.telegram}
                onChange={handleInputChange("telegram")}
                required
                pattern="@[A-Za-z0-9_]{5,32}"
                title="Telegram username @ bilan boshlanishi va 5-32 ta harf, raqam yoki pastki chiziqdan iborat bo'lishi kerak"
                className={`${INPUT_BASE_CLASS} ${formErrors.telegram ? "border-red-500" : ""}`}
                disabled={isFormDisabled}
              />
              {formErrors.telegram && (
                <p className="text-sm text-red-500 mt-1">{formErrors.telegram}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="cursor-pointer w-full h-14 text-lg font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isSubmitDisabled}
            >
              {isSubmitting ? "Saqlanmoqda..." : "SAQLASH"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
