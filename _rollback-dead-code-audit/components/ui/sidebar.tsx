"use client";
import { cn } from "../../lib/utils";
import React, { useState, createContext, useContext, useEffect } from "react";
import { AnimatePresence, motion, HTMLMotionProps  } from "framer-motion";
import { Link } from 'react-router-dom';

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
  className,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
  className?: string;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      <div className={className}>{children}</div>
    </SidebarProvider>
  );
};

export const SidebarBody = ({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & HTMLMotionProps<"div">) => {
  const { open, setOpen } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isHovered && open && !isMobile) {
      timer = setTimeout(() => {
        setOpen(false);
      }, 200);
    }
    return () => clearTimeout(timer);
  }, [isHovered, open, setOpen, isMobile]);

  if (isMobile) {
    return (
      <>
        <div className={cn(
          "fixed top-0 left-0 h-16 px-4 py-4 flex md:hidden items-center justify-between bg-white dark:bg-black w-full border-b-4 dark:border-cyan-300 border-gray-400 z-40"
        )}>
          <button
            onClick={() => setOpen(!open)}
            className="text-black dark:text-white"
          >
            <box-icon name="menu" color="currentColor"></box-icon>
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={cn(
                "fixed h-full w-64 inset-0 bg-white dark:bg-black p-4 z-[100] flex flex-col justify-between border-r-4 dark:border-cyan-300 border-gray-400",
                className
              )}
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setOpen(!open)}
                  className="text-black dark:text-white"
                >
                  <box-icon name="x" color="currentColor"></box-icon>
                </button>
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <motion.div
      className={cn(
        "fixed h-screen px-4 py-4 hidden md:flex flex-col bg-white dark:bg-black border-r-4 dark:border-cyan-300 border-gray-400 z-30",
        className
      )}
      initial={{ width: "80px" }}
      animate={{
        width: open ? "250px" : "80px",
        transition: { type: "spring", stiffness: 300, damping: 30 }
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        setOpen(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  return (
    <Link
      to={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-lg hover:bg-cyan-800 hover:text-white transition-colors",
        className
      )}
      {...props}
    >
      <div className="text-black dark:text-white">{link.icon}</div>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm whitespace-pre inline-block"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};