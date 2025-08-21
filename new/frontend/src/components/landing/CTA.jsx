import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CTA = ({ onGetStarted }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="relative mt-32 px-4 text-center"
    >
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-border">
        <CardContent className="p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Ready to study smarter?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
            Join thousands of students who are already learning more effectively
            with AI-powered study tools and personalized learning paths.
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg"
          >
            Start Your Learning Journey
          </Button>
        </CardContent>
      </Card>
    </motion.section>
  );
};

export default CTA;
