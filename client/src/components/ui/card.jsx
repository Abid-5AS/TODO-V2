// src/components/ui/card.jsx
// UI Component: Card layout primitive.

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

// Decide whether to use motion based on prop
const CardComponent = ({ animate, className, ...props }, ref) => {
  const Component = animate ? motion.div : "div";
  const motionProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
    whileHover: { scale: 1.01, boxShadow: "var(--tw-shadow-lg)" }, // Use Tailwind shadow
    layout: true, // Enable layout animation
  } : {};

  return (
    <Component
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow duration-300",
        className
      )}
      {...motionProps}
      {...props}
    />
  );
};

const Card = React.forwardRef(CardComponent);
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 md:p-5", className)} // Adjusted padding
    {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)} // Adjusted size
    {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 md:p-5 pt-0", className)} {...props} /> // Adjusted padding
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 md:p-5 pt-0", className)} // Adjusted padding
    {...props} />
))
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
