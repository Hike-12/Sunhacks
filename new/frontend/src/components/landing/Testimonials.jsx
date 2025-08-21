import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    content:
      "StudyGenie transformed my exam prep! The AI-generated flashcards from my textbooks helped me ace my physics exam.",
    name: "Priya Sharma",
    role: "Engineering Student",
    initial: "P",
  },
  {
    content:
      "The multilingual support is amazing. I can now study complex topics in Hindi, making learning so much easier.",
    name: "Arjun Patel",
    role: "Medical Student",
    initial: "A",
  },
  {
    content:
      "Progress tracking keeps me motivated. The spaced repetition system ensures I remember everything long-term.",
    name: "Sneha Reddy",
    role: "CA Aspirant",
    initial: "S",
  },
];

const Testimonials = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative mt-32 px-4"
      id="testimonials"
    >
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 text-foreground">
        Loved by <span className="text-primary">Students</span>
      </h2>
      <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        Join thousands of students who are already learning smarter with
        StudyGenie
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
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
            <Card className="h-full">
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {testimonial.initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default Testimonials;
