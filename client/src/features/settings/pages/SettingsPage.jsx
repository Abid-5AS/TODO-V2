// src/features/settings/pages/SettingsPage.jsx
// Main page for displaying settings options, using tabs for organization.

import { motion } from "framer-motion";
import { useTitle } from "../../../hooks/useTitle"; // Corrected path
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"; // Corrected path
import AISettings from "../components/AISettings";
import { SlidersHorizontal, Bot, Palette, UserCircle } from 'lucide-react';

const SettingsPage = () => {
  useTitle("Settings - Task Tree");

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { opacity: 0, y: -10 }
  };

  const contentVariants = {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { delay: 0.2, duration: 0.3 } },
      exit: { opacity: 0 }
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="container max-w-4xl mx-auto py-6 md:py-8 px-4 space-y-6"
    >
      <div className="space-y-1.5 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <SlidersHorizontal className="text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your application preferences and configurations.
        </p>
      </div>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 h-auto">
          <TabsTrigger value="ai" className="py-2">
              <Bot className="h-4 w-4 mr-2" /> AI Features
          </TabsTrigger>
          <TabsTrigger value="appearance" className="py-2">
              <Palette className="h-4 w-4 mr-2" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="account" className="py-2">
              <UserCircle className="h-4 w-4 mr-2" /> Account
          </TabsTrigger>
        </TabsList>
        
        <motion.div variants={contentVariants}>
            <TabsContent value="ai" className="mt-0">
            {/* AISettings already has animation, no need to double wrap */}
            <AISettings />
            </TabsContent>
            
            <TabsContent value="appearance" className="mt-0">
            <div className="text-center p-12 rounded-lg bg-muted/30 border">
                <h3 className="text-lg font-medium">Appearance Settings</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                Customize the look and feel (coming soon).
                </p>
            </div>
            </TabsContent>
            
            <TabsContent value="account" className="mt-0">
            <div className="text-center p-12 rounded-lg bg-muted/30 border">
                <h3 className="text-lg font-medium">Account Settings</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                Manage your account details (coming soon).
                </p>
            </div>
            </TabsContent>
        </motion.div>
      </Tabs>
    </motion.div>
  );
};

export default SettingsPage;
