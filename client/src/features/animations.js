// src/features/animations.js
// Defines common animation variants used across features.

export const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Stagger animation for each item
      delayChildren: 0.1, // Delay before starting stagger
    },
  },
};

export const taskItemVariants = {
  hidden: { y: 15, opacity: 0, scale: 0.98 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 450,
      damping: 30,
      // duration: 0.4, 
      // ease: "easeOut" 
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    // x: -30, // Optional: slide out effect
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export const sidebarVariants = {
  open: {
    x: 0,
    width: '16rem', // Corresponds to w-64
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
  closed: {
    x: -50,
    width: '16rem', // Keep width for calculation, hide with x/opacity
    opacity: 0,
    transition: {
      type: 'spring',
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
