import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";

const navItems = [
  { name: "Home", href: "#" },
  { name: "Features", href: "#features" },
  { name: "Testimonials", href: "#testimonials" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [language, setLanguage] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("language") || "en"
      : "en"
  );

  // dropdown state & ref for outside-click handling
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("language");
    if (stored) setLanguage(stored);
  }, []);

  // close language menu on outside click / escape
  useEffect(() => {
    const onDocClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target))
        setLangOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const showToast = (
    msg = "Feature paused to save API credits — translation disabled"
  ) => {
    toast(msg, { duration: 3200 });
  };

  const onSelectLang = (lang) => {
    setLanguage(lang);
    try {
      localStorage.setItem("language", lang);
    } catch (e) {}
    setLangOpen(false);
    showToast();
  };

  return (
    <>
      <Toaster position="top-right" />
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
          isScrolled ? "w-11/12 max-w-4xl" : "w-11/12 max-w-5xl"
        }`}
      >
        <div
          className={`
            px-4 sm:px-6 py-3 rounded-full transition-all duration-300
            ${
              isDark
                ? "bg-[#080808]/80 border border-[#f8f8f8]/20"
                : "bg-[#f8f8f8]/80 border border-[#080808]/20"
            }
            backdrop-blur-md shadow-lg
          `}
        >
          <div className="flex items-center justify-between">
            {/* Logo + Name: always visible (phones + laptops) */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#222052] to-[#222052]/70 rounded-lg flex items-center justify-center">
                <img className="w-6 h-6" src="/logo.png" alt="Logo" />
              </div>
              <span
                className={`text-xl font-bold ${
                  isDark
                    ? "bg-gradient-to-r from-[#f8f8f8] to-[#f8f8f8]/80 bg-clip-text text-transparent"
                    : "bg-gradient-to-r from-[#222052] to-[#222052]/80 bg-clip-text text-transparent"
                }`}
              >
                StudyAid
              </span>
            </motion.div>

            {/* Navigation - hidden on small screens (unchanged for laptop) */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ y: -2 }}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isDark
                      ? "text-[#f8f8f8]/70 hover:text-[#f8f8f8]"
                      : "text-[#080808]/70 hover:text-[#080808]"
                  }`}
                >
                  {item.name}
                </motion.a>
              ))}
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <ThemeToggle />

              {/* language dropdown - hidden on phones */}
              <div
                className="hidden sm:inline-block relative text-left mr-2 sm:mr-4"
                ref={langRef}
              >
                <button
                  aria-haspopup="true"
                  aria-expanded={langOpen}
                  className="inline-flex items-center px-3 py-2 bg-white/5 border rounded-md text-sm font-medium hover:bg-white/10 transition touch-manipulation"
                  onClick={() => setLangOpen((v) => !v)}
                  type="button"
                >
                  {language === "en"
                    ? "EN"
                    : language === "mr"
                    ? "MR"
                    : language.toUpperCase()}
                  <svg
                    className="ml-2 w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.98l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <div
                  className={`${
                    langOpen ? "" : "hidden"
                  } origin-top-right absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white/90 dark:bg-[#0b0b0b]/95 z-50 max-w-[92vw]`}
                  style={{ minWidth: 140 }}
                >
                  <div className="py-1">
                    <button
                      className="w-full text-left px-4 py-3 text-sm touch-manipulation"
                      onClick={() => onSelectLang("en")}
                    >
                      English
                    </button>
                    <button
                      className="w-full text-left px-4 py-3 text-sm"
                      onClick={() => onSelectLang("mr")}
                    >
                      Marathi
                    </button>
                    <button
                      className="w-full text-left px-4 py-3 text-sm"
                      onClick={() => onSelectLang("hi")}
                    >
                      Hindi
                    </button>
                  </div>
                </div>
              </div>

              {/* CTA - hidden on phones */}
              <div className="hidden sm:inline-flex">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 sm:px-4 py-2 bg-[#222052] text-[#f8f8f8] rounded-full text-sm font-medium hover:bg-[#222052]/90 transition-colors duration-200"
                  onClick={() => navigate("/login")}
                  type="button"
                >
                  Get Started
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export default Navbar;