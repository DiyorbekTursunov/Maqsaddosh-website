import { useState } from "react";
import { Menu, PlusCircle, Bell, User2, Send, ChevronDown, Navigation } from "lucide-react";
import Navbar from "../../components/navbar/Navbar";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const faqData = [
  {
    id: "item-1",
    question: "Maqsadga sodiqlik",
    answer:
      "Har bir foydalanuvchining maqsadi biz uchun muhim. Biz odamlarga o‘z yo‘lidan chetga chiqmasdan qat’iyat bilan harakat qilishda yordam beramiz.",
  },
  {
    id: "item-2",
    question: "Birgalikda o‘sish",
    answer:
      "Haqiqiy o‘sish yolg‘izlikda emas — birga intilishda ro‘y beradi. Biz jamoaviy muvaffaqiyatni individual yutuqdan ustun qo‘yamiz.",
  },
  {
    id: "item-3",
    question: "Halollik va ochiqlik",
    answer:
      "Platformamizda har bir foydalanuvchi o‘z haqiqiy holatini ko‘rsata oladi — bu yerda taqqoslash emas, qo‘llab-quvvatlash bor.",
  },
  {
    id: "item-4",
    question: "Doimiy o‘zgarish va rivojlanish",
    answer:
      "Biz uchun har bir kichik qadam — katta o‘zgarish sari qadam. Harakatdagi barqarorlik – bizning ustuvor qadriyatimiz.",
  },
  {
    id: "item-5",
    question: "Ilhom va motivatsiya",
    answer:
      "Maqsaddosh faqat vosita emas, balki har kuni sizni oldinga undovchi ilhom manbaidir.",
  },
];

export default function SupportPage() {
  const [openAccordionItemId, setOpenAccordionItemId] = useState<string | undefined>(faqData[0].id);
  const navigate = useNavigate();

  const handleAccordionToggle = (itemId: string) => {
    setOpenAccordionItemId((prevId) => (prevId === itemId ? undefined : itemId));
  };

  const handleContactClick = () => {
    // Redirect to external URL (e.g., Telegram)
    window.location.href = "https://t.me/maqsaddosh_support";
    // Alternatively, to open in a new tab:
    // window.open("https://t.me/maqsaddosh_support", "_blank");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-[1200px] mx-auto">
        <Navbar />
        <main className="flex flex-col lg:flex-row lg:justify-between px-6 py-12 gap-12 lg:gap-[100px]">
          <div className="lg:w-[500px] flex-shrink-0">
            <p className="text-gray-600 text-xl mb-6">Yordam kerakmi?</p>
            <h1 className="text-4xl lg:text-[40px] font-bold leading-tight text-gray-800 mb-8">
              Bizda 24/7 mavjud qo'llab-quvvatlash.
            </h1>
            <a href="https://t.me/maqsaddosh_support" target="_blank"
              type="button"

              className="cursor-pointer bg-blue-700 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl h-[60px] w-full sm:w-[285px] text-base font-semibold flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Send className="w-5 h-5" />
              BOG'LANISH
            </a>
          </div>

          <div className="lg:w-[600px] flex-shrink-0">
            <div className="w-full flex flex-col gap-4">
              {faqData.map((item) => {
                const isOpen = openAccordionItemId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl overflow-hidden border transition-all duration-300 ${
                      isOpen
                        ? "bg-gradient-to-br from-blue-600 to-blue-700 border-transparent text-white"
                        : "bg-white border-gray-200 text-gray-800 hover:border-gray-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleAccordionToggle(item.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-content-${item.id}`}
                      className={`cursor-pointer flex justify-between items-center w-full px-6 py-5 text-left font-medium text-base group focus:outline-none ${
                        isOpen ? "text-white" : "text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      <span className="flex-grow">{item.question}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ml-4 shrink-0 ${
                          isOpen ? "bg-white" : "bg-gray-100 group-hover:bg-gray-200"
                        }`}
                      >
                        <ChevronDown
                          className={`w-4 h-4 ${
                            isOpen
                              ? "text-blue-700"
                              : "text-gray-500 group-hover:text-gray-700"
                          }`}
                        />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial="collapsed"
                          animate="open"
                          exit="collapsed"
                          variants={{
                            open: { height: "auto", opacity: 1 },
                            collapsed: { height: 0, opacity: 0 },
                          }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <motion.div
                            className="px-6 pb-6 pt-2 text-sm text-white opacity-95"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {item.answer}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
