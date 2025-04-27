// src/components/ui/sidebar.jsx
// UI Component: A complex, reusable Sidebar component with context and sub-components.
// Note: Keeping this in `ui` as it's primarily a layout primitive, though used heavily by Dashboard.

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";
import { PanelLeftIcon } from "lucide-react"

import { useIsMobile } from "../../hooks/use-mobile" // Corrected path
import { cn } from "../../lib/utils" // Corrected path
import { Button } from "./button"
import { Input } from "./input"
import { Separator } from "./separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet"
import { Skeleton } from "./skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

// --- Context Setup ( 그대로 유지 ) --- 
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 1 week
const SIDEBAR_WIDTH = "16rem"; // Default width (w-64)
const SIDEBAR_WIDTH_MOBILE = "18rem"; // Mobile sheet width
const SIDEBAR_WIDTH_ICON = "3.5rem"; // Collapsed width (w-14)
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

const SidebarContext = React.createContext(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

// --- SidebarProvider ( 그대로 유지, 쿠키 로직 추가 ) --- 
function SidebarProvider({
  defaultOpen: defaultOpenProp = true,
  open: openProp,
  onOpenChange: setOpenProp,
  storageKey = SIDEBAR_COOKIE_NAME,
  children,
  ...props
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // Initialize state from cookie or default
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [_open, _setOpen] = React.useState(() => defaultOpenProp);

  // Read from cookie on mount
  React.useEffect(() => {
      if (typeof window !== 'undefined') {
          const savedState = document.cookie
              .split('; ')
              .find(row => row.startsWith(`${storageKey}=`))
              ?.split('=')[1];
          if (savedState !== undefined) {
              _setOpen(savedState === 'true');
          }
          setIsInitialized(true);
      }
  }, [storageKey]);

  const open = openProp ?? _open;

  const setOpen = React.useCallback((value) => {
      const newState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
          setOpenProp(newState);
      } else {
          _setOpen(newState);
      }
      // Save state to cookie
      if (typeof document !== 'undefined') {
          document.cookie = `${storageKey}=${newState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; SameSite=Lax`;
      }
  }, [setOpenProp, open, storageKey]);

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((o) => !o) : setOpen((o) => !o);
  }, [isMobile, setOpen, setOpenMobile]);

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const state = !isInitialized ? 'loading' : (open ? "expanded" : "collapsed");

  const contextValue = React.useMemo(() => ({
    state,
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar,
    isInitialized,
  }), [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar, isInitialized]);

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={{ ...props.style, "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON }}
          className={cn("group/sidebar-wrapper flex min-h-svh w-full", props.className)}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

// --- Sidebar Component ( 그대로 유지 ) --- 
const Sidebar = React.forwardRef(({
  side = "left",
  collapsible = true, // Default to collapsible
  className,
  children,
  ...props
}, ref) => {
  const { isMobile, state, openMobile, setOpenMobile, isInitialized } = useSidebar();

  // Loading state before cookie is read
   if (!isInitialized && !isMobile) {
     return (
       <div
         ref={ref}
         className={cn("w-64 h-screen flex-shrink-0 border-r bg-muted/40", className)}
       >
         {/* Optional: Add skeleton loaders here */}
         <div className="p-4 space-y-4">
             <Skeleton className="h-8 w-3/4" />
             <Skeleton className="h-6 w-full" />
             <Skeleton className="h-6 w-5/6" />
             <Skeleton className="h-6 w-full" />
         </div>
       </div>
     );
   }

  // Mobile view uses Sheet
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        {/* Trigger is usually outside the Sidebar component */} 
        <SheetContent
          side={side}
          className={cn("w-[--sidebar-width] p-0 bg-background border-none flex flex-col", className)}
          style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE }}
          data-sidebar="mobile"
          {...props} // Allow passing other SheetContent props
        >
          {children} { /* The actual sidebar content goes here */}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop view
  return (
    <div
      ref={ref}
      data-state={state} // collapsed or expanded
      data-collapsible={collapsible}
      data-side={side}
      className={cn(
        "hidden md:flex flex-col flex-shrink-0 transition-[width] duration-300 ease-in-out border-r",
        state === "expanded" ? "w-64" : (collapsible ? "w-14" : "w-64"), // Adjust width based on state and collapsible
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Sidebar.displayName = "Sidebar";

// --- SidebarTrigger ( 그대로 유지 ) --- 
const SidebarTrigger = React.forwardRef(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("size-8", className)} // Adjusted size
      onClick={toggleSidebar}
      aria-label="Toggle Sidebar"
      {...props}
    >
      <PanelLeftIcon className="size-4" />
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

// --- SidebarHeader, SidebarContent, SidebarFooter (Simplified) --- 
const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => {
  const { state } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center border-b p-3 transition-all", 
        state === 'collapsed' ? 'h-14 justify-center' : 'h-14 justify-between',
        className
        )}
      {...props} 
    />
  );
});
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)} {...props} />
));
SidebarContent.displayName = "SidebarContent";

const SidebarFooter = React.forwardRef(({ className, ...props }, ref) => {
   const { state } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "mt-auto border-t p-3 transition-opacity",
        state === 'collapsed' ? 'opacity-0 h-0 p-0 overflow-hidden' : 'opacity-100',
         className
      )}
      {...props} 
    />
  );
});
SidebarFooter.displayName = "SidebarFooter";


// --- Sidebar Components (Group, Label, Menu, Item, etc.) - Simplified for clarity --- 

const SidebarSectionLabel = React.forwardRef(({ className, children, ...props }, ref) => {
  const { state } = useSidebar();
  return (
    <div 
        ref={ref}
        className={cn(
          "px-3 py-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider transition-opacity duration-200", 
          state === 'collapsed' ? 'opacity-0 h-0 py-0 invisible' : 'opacity-100 h-auto visible',
          className
        )}
         {...props}
     >
         {state === 'expanded' && children}
     </div>
  );
});
SidebarSectionLabel.displayName = "SidebarSectionLabel";

const SidebarNav = React.forwardRef(({ className, ...props }, ref) => (
    <nav ref={ref} className={cn("px-2 py-1 space-y-0.5", className)} {...props} />
));
SidebarNav.displayName = "SidebarNav";

const SidebarNavLink = React.forwardRef(({ className, children, icon: Icon, isActive, tooltip, ...props }, ref) => {
    const { state } = useSidebar();
    const linkContent = (
        <span className={cn("flex items-center gap-3", state === 'collapsed' ? 'justify-center' : '')}>
            {Icon && <Icon className="size-4 flex-shrink-0" />}
            <span className={cn("truncate transition-opacity duration-200", state === 'collapsed' ? 'opacity-0 absolute' : 'opacity-100')}>
                {children}
            </span>
        </span>
    );

    const linkElement = (
        <a
            ref={ref}
            className={cn(
                "flex items-center rounded-md text-sm font-medium transition-colors duration-200 h-9",
                state === 'expanded' ? 'px-3 py-2 justify-start' : 'px-0 py-2 justify-center w-9 mx-auto',
                isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                className
            )}
            {...props}
        >
            {linkContent}
        </a>
    );

     if (state === 'collapsed' && tooltip) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{linkElement}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={5}>{tooltip}</TooltipContent>
            </Tooltip>
        );
    }

    return linkElement;
});
SidebarNavLink.displayName = "SidebarNavLink";


// --- Export --- 
export {
  SidebarProvider,
  useSidebar,
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarSectionLabel,
  SidebarNav,
  SidebarNavLink,
  // Keep other sub-components if they were implemented and needed
  // SidebarRail, SidebarInset, SidebarInput, SidebarSeparator, 
  // SidebarGroup, SidebarGroupLabel, SidebarGroupAction, SidebarGroupContent, 
  // SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction, SidebarMenuBadge, 
  // SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton
};
