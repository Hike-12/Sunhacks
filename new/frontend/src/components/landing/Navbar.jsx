import React, { useState, useRef } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = ({ onGetStarted }) => {
  const ref = useRef(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <motion.div
      ref={ref}
      className="fixed inset-x-0 top-0 z-50 max-w-6xl mx-auto mb-16 md:mb-0"
    >
      {/* Desktop Navbar */}
      <motion.div
        animate={{
          backdropFilter: visible ? "blur(10px)" : "none",
          border: visible ? "1px solid hsl(var(--border))" : "none",
          width: visible ? "40%" : "100%",
          y: visible ? 20 : 0,
          backgroundColor: visible
            ? "hsl(var(--background) / 0.8)"
            : "hsl(var(--background) / 0)",
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 50,
        }}
        style={{
          minWidth: visible ? "800px" : "100%",
        }}
        className="relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between rounded-lg px-6 py-4 md:flex"
      >
        <div className="flex w-full items-center justify-between">
          <motion.h1
            animate={{
              scale: visible ? 0.9 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="text-2xl font-bold text-primary"
          >
            StudyG
          </motion.h1>

          <motion.nav
            animate={{
              opacity: 1,
            }}
            className="absolute left-1/2 flex -translate-x-1/2 items-center space-x-6"
          >
            {["Features", "Testimonials"].map((item, idx) => (
              <Button
                key={idx}
                variant="ghost"
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-muted-foreground hover:text-foreground"
              >
                {item}
              </Button>
            ))}
          </motion.nav>

          <Button
            onClick={onGetStarted}
            className="bg-primary hover:bg-primary/90"
          >
            Get Started
          </Button>
        </div>
      </motion.div>

      {/* Mobile navbar */}
      <motion.div
        animate={{
          backdropFilter: visible ? "blur(10px)" : "none",
          border: visible ? "1px solid hsl(var(--border))" : "none",
          y: visible ? 20 : 0,
          backgroundColor: visible
            ? "hsl(var(--background) / 0.8)"
            : "hsl(var(--background) / 0)",
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 50,
        }}
        className="md:hidden flex items-center justify-between px-6 py-4 mt-4 mx-4 rounded-lg"
      >
        <motion.h1
          animate={{
            scale: visible ? 0.9 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="text-xl font-bold text-primary"
        >
          StudyGenie
        </motion.h1>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="md:hidden absolute top-full left-0 right-0 mt-2 mx-4"
          >
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              {["Features", "Testimonials"].map((item, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  {item}
                </Button>
              ))}

              <Button
                onClick={() => {
                  onGetStarted();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Navbar;
