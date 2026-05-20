"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" };

export default function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-600/30 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className={`relative w-full ${sizes[size]} rounded-3xl p-6 shadow-2xl z-10`}
            style={{ background: "#FFFFFF", border: "1px solid rgba(255,45,120,0.15)", boxShadow: "0 20px 60px rgba(255,45,120,0.12)" }}
          >
            <div className="absolute top-0 left-6 right-6 h-px rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,45,120,0.4), transparent)" }} />
            {title && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-deep">{title}</h2>
                <button onClick={onClose}
                  className="p-2 rounded-xl hover:bg-primary-pale transition-colors text-slate hover:text-primary">
                  <X size={20} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
