// src/features/settings/pages/SettingsPage.jsx
// Main page for displaying settings options, using tabs for organization.

import { motion } from "framer-motion";
import { useTitle } from "../../../hooks/useTitle"; // Corrected path
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs"; // Corrected path
import AISettings from "../components/AISettings";
import AppearanceSettings from "../components/AppearanceSettings";
import { SlidersHorizontal, Bot, Palette, UserCircle } from "lucide-react";

const SettingsPage = () => {
  useTitle("Settings - Task Tree");

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -10 },
  };

  const contentVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { delay: 0.2, duration: 0.3 } },
    exit: { opacity: 0 },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="py-4 px-2 sm:py-6 sm:px-4 bg-theme relative rounded-xl shadow-md mx-2 sm:mx-4 my-2"
    >
      <div className="space-y-1.5 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2 text-center bg-gradient-to-r from-primary/90 via-purple-500/90 to-pink-500/90 bg-clip-text text-transparent animate-gradient-x">
          <SlidersHorizontal className="text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground text-center">
          Manage your application preferences and configurations.
        </p>
      </div>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 h-auto glass-card relative">
          <TabsTrigger
            value="ai"
            className="py-2 data-[state=active]:glass-button"
          >
            <Bot className="h-4 w-4 mr-2" /> AI Features
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="py-2 data-[state=active]:glass-button"
          >
            <Palette className="h-4 w-4 mr-2" /> Appearance
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="py-2 data-[state=active]:glass-button"
          >
            <UserCircle className="h-4 w-4 mr-2" /> Account
          </TabsTrigger>
        </TabsList>

        <motion.div variants={contentVariants}>
          <TabsContent value="ai" className="mt-0">
            {/* AISettings already has animation, no need to double wrap */}
            <AISettings />
          </TabsContent>

          <TabsContent value="appearance" className="mt-0">
            <AppearanceSettings />
          </TabsContent>

          <TabsContent value="account" className="mt-0">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: "easeOut" },
                },
              }}
              className="w-full bg-card/70 backdrop-blur-sm border-border/50 p-6 rounded-lg"
            >
              <h3 className="text-lg font-medium text-center">
                Account Settings
              </h3>
              <p className="text-muted-foreground mt-2 text-sm text-center">
                Manage your account details (coming soon).
              </p>
            </motion.div>
          </TabsContent>
        </motion.div>
      </Tabs>
    </motion.div>
  );
};

export default SettingsPage;
