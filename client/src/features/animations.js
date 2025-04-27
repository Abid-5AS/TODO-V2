// src/features/animations.js
// Defines common animation variants used across features.

export const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.01, // Further reduced stagger time
      delayChildren: 0.01, // Minimal delay
    },
  },
};

export const taskItemVariants = {
  hidden: { y: 5, opacity: 0, scale: 0.99 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "tween",
      duration: 0.15, // Even faster animation
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.99,
    // x: -30, // Optional: slide out effect
    transition: { duration: 0.1, ease: "easeIn" },
  },
};

export const sidebarVariants = {
  open: {
    x: 0,
    width: "16rem", // Corresponds to w-64
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
  closed: {
    x: -50,
    width: "16rem", // Keep width for calculation, hide with x/opacity
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
  },
};

export const sidebarItemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 20,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
};
