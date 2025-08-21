import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Hero = ({ onGetStarted }) => {
  const navigate = useNavigate();
  return (
    <div className="relative mx-auto my-12 flex max-w-7xl flex-col items-center justify-center">
      <div className="px-4 py-10 md:py-20">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-foreground md:text-4xl lg:text-6xl">
          {"Transform any material into personalized study guides"
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="relative z-10 mx-auto max-w-2xl py-4 text-center text-lg font-normal text-muted-foreground"
        >
          Upload PDFs, handwritten notes, or books and get AI-generated quizzes,
          flashcards, and interactive study materials. Personalized learning
          with multilingual support and progress tracking.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
          className="relative z-10 mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            onClick={onGetStarted}
            size="lg"
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 px-8"
          >
            Start Learning Free
          </Button>
          <Button
            onClick={() => navigate("/docs")}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-8"
          >
            View Documentation
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.2 }}
          className="relative z-10 mt-20"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <img
                src="/dashboard.png"
                alt="StudyGenie Dashboard Preview"
                className="aspect-[16/9] h-auto w-full object-cover"
                height={1000}
                width={1000}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
