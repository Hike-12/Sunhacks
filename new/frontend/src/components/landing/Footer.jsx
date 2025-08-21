import React from "react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="max-w-6xl mx-auto relative mt-32 py-8">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="container mx-auto px-4 max-w-6xl"
      >
        <div className="flex flex-col gap-4 sm:flex-row justify-between items-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} StudyGenie. All rights reserved.</p>
          <p>
            crafted by{" "}
            <a
              href="https://github.com/romeirofernandes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              romeiro
            </a>
          </p>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
