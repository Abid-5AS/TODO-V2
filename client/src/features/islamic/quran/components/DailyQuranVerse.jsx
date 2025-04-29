import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BookText, RefreshCw, Loader2, Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDailyQuranVerse } from "../hooks"; // Import the new hook
import { parseVerseReference } from "../utils"; // Corrected import path

const DailyQuranVerse = () => {
  const { verseData, isLoading, error, isRefreshing, handleRefresh } = useDailyQuranVerse();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!verseData) return;
    const textToCopy = `${verseData.arabicText}\\n${verseData.englishText}\\n- Quran ${verseData.reference} [${verseData.translation}]`;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setIsCopied(true);
        toast.success("Verse copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy verse.");
      });
  };

  const handleShare = () => {
    if (!verseData || !navigator.share) {
      toast.error("Web Share API not supported or no verse data.");
      return;
    }
    const shareData = {
      title: `Daily Quran Verse: ${verseData.reference}`,
      text: `${verseData.arabicText}\\n${verseData.englishText}\\n- Quran ${verseData.reference} [${verseData.translation}]`,
      // url: window.location.href, 
    };
    navigator
      .share(shareData)
      .then(() => console.log("Verse shared successfully"))
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Error sharing verse:", error);
          toast.error("Failed to share verse.");
        }
      });
  };

  // Motion variants for animations
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (isLoading) {
    return (
      <Card className="glass-card border-purple-300/20">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-600 dark:text-purple-400">
            <BookText size={20} className="mr-2" />
            Daily Quran Verse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-1/4 mb-4" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Skeleton className="h-8 w-20" />
        </CardFooter>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card border-red-400/30 bg-red-50/50 dark:bg-red-900/10">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600 dark:text-red-400">
            <BookText size={20} className="mr-2" />
            Daily Quran Verse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 dark:text-red-300">
            Error loading verse: {error}
          </p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!verseData) {
    return null; // Should not happen if loading/error states are handled
  }
  
  const { surah, ayah } = parseVerseReference(verseData.reference);

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Card className="glass-card border-purple-300/20 bg-gradient-to-br from-purple-50/20 to-indigo-50/10 dark:from-purple-950/20 dark:to-indigo-950/10 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-purple-600 dark:text-purple-400">
            <div className="flex items-center">
              <BookText size={20} className="mr-2" />
              Daily Quran Verse
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-purple-500 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
              onClick={handleRefresh} // Use handleRefresh from hook
              disabled={isRefreshing}
              title="Refresh Verse"
            >
              {isRefreshing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
            </Button>
          </CardTitle>
          {/* Display Surah:Ayah format */}
          <div className="text-sm text-muted-foreground pt-1">
            Surah <span className="font-semibold">{surah}</span> : Ayah <span className="font-semibold">{ayah}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p
            className="text-lg leading-relaxed text-right font-arabic text-gray-800 dark:text-gray-200"
            dir="rtl"
          >
            {verseData.arabicText}
          </p>
          <Separator className="bg-purple-200/50 dark:bg-purple-800/30" />
          <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
            {verseData.englishText}
          </p>
          <p className="text-xs text-right text-muted-foreground italic pt-2">
            Translator: {verseData.translation}
          </p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2 bg-black/5 dark:bg-white/5 py-3 px-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://quran.com/${surah}/${ayah}`, '_blank')}
            className="border-purple-200 hover:bg-purple-100/50 dark:border-purple-800 dark:hover:bg-purple-900/30"
          >
            <BookText size={16} className="mr-1" />
            Read on Quran.com
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="border-purple-200 hover:bg-purple-100/50 dark:border-purple-800 dark:hover:bg-purple-900/30"
          >
            {isCopied ? (
              <Check size={16} className="mr-1 text-green-500" />
            ) : (
              <Copy size={16} className="mr-1" />
            )}
            Copy
          </Button>
          {navigator.share && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-purple-200 hover:bg-purple-100/50 dark:border-purple-800 dark:hover:bg-purple-900/30"
            >
              <Share2 size={16} className="mr-1" />
              Share
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default DailyQuranVerse; 