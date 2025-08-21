import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Brain, Languages, TrendingUp, Zap, Users } from "lucide-react";

const features = [
  {
    title: "Smart Content Processing",
    description:
      "Upload PDFs, handwritten notes, or books. AI extracts text with OCR and generates summaries automatically.",
    icon: Upload,
  },
  {
    title: "AI-Powered Study Materials",
    description:
      "Auto-generate quizzes, flashcards, and interactive content from your materials using advanced AI.",
    icon: Brain,
  },
  {
    title: "Multilingual Support",
    description:
      "Study in English, Hindi, Marathi, and regional languages. Perfect for diverse learning needs.",
    icon: Languages,
  },
  {
    title: "Progress Tracking",
    description:
      "Dashboard with progress bars, study streaks, and knowledge heatmaps to monitor your growth.",
    icon: TrendingUp,
  },
  {
    title: "Spaced Repetition",
    description:
      "Built-in flashcard system with active recall and spaced repetition for optimal retention.",
    icon: Zap,
  },
  {
    title: "AI Tutor",
    description:
      "Interactive RAG-powered AI tutor that answers questions directly from your study materials.",
    icon: Users,
  },
];

const Features = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      viewport={{ once: true }}
      className="relative mt-32 px-4"
      id="features"
    >
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 text-foreground">
        Powerful{" "}
        <span className="text-primary" aria-hidden="true">
          Features
        </span>
      </h2>
      <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        Everything you need to transform your learning experience with
        AI-powered study tools
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                ease: "easeInOut",
              }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow bg-card border-border">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-card-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};

export default Features;
