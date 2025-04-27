// src/features/dashboard/components/Navbar.jsx
// Renders the top navigation bar, handling theme toggle, user menu, and sidebar toggle for mobile.

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/contexts/AuthContext"; // Corrected path
import { Menu, Sun, Moon, LogOut, User, Settings } from "lucide-react";
import { Button } from "../../../components/ui/button"; // Corrected path
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar"; // Corrected path
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../../components/ui/dropdown-menu"; // Corrected path
import { motion } from "framer-motion";

const Navbar = ({ onSidebarToggle, onAddTask, className }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on login or signup page (public view)
  const isPublicAuthPage = ["/login", "/signup"].includes(location.pathname);

  const [dark, setDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const toggleDark = () => setDark((d) => !d);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true }); // Navigate after logout
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Adjust styles based on authentication state for clearer separation
  const navbarClasses = className || "glass-navbar sticky top-0 z-30";

  const buttonClass = "glass-button";

  return (
    <motion.nav
      className={navbarClasses}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <div className="px-4 py-2 flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <div className="flex items-center md:hidden">
              {" "}
              {/* Only show on mobile */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9, rotate: -5 }}
                className="icon-animated"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSidebarToggle} // Use the passed toggle function
                  aria-label="Toggle sidebar"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          )}
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="text-xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x"
          >
            Task Manager
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.15, rotate: dark ? 25 : -25 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="icon-animated"
          >
            <Button
              variant="ghost"
              className={`${buttonClass} rounded-full glass-button`}
              size="icon"
              aria-label="Toggle dark mode"
              onClick={toggleDark}
            >
              {dark ? (
                <Sun className="h-5 w-5 text-yellow-400 animate-pulse-slow" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </Button>
          </motion.div>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`${buttonClass} rounded-full h-9 w-9 p-0`}
                  aria-label="User menu"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="icon-animated"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          user.photo ||
                          `https://avatar.vercel.sh/${
                            user.email || user.name
                          }.png`
                        }
                        alt={user.name || "User"}
                        className="border-2 border-transparent group-hover:border-primary/30"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-medium">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="glass-card border-gray-200/40 dark:border-zinc-700/40 shadow-lg rounded-lg mt-1 w-48"
              >
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/settings"
                    className="cursor-pointer flex items-center text-sm py-1.5 px-2"
                  >
                    <Settings className="mr-2 h-4 w-4 text-muted-foreground icon-animated" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer flex items-center text-sm py-1.5 px-2 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/30 focus:text-red-700 dark:focus:text-red-300"
                >
                  <LogOut className="mr-2 h-4 w-4 icon-animated" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Show Login/Signup buttons only if NOT on those pages already
            !isPublicAuthPage && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="glass-button"
                  asChild
                >
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" className="glass-button glow-effect" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
