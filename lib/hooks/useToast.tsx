"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";

type ToastType = "success" | "error" | "info" | "warning";

export function useToast() {
  const showToast = useCallback((message: string, type: ToastType = "info") => {
    switch (type) {
      case "success":
        toast.success(message, {
          icon: "🎉",
          style: {
            background: "#1A1A1F",
            color: "#F5F5F5",
            border: "1px solid rgba(95, 111, 255, 0.2)",
          },
        });
        break;
      case "error":
        toast.error(message, {
          icon: "❌",
          style: {
            background: "#1A1A1F",
            color: "#F5F5F5",
            border: "1px solid rgba(255, 100, 100, 0.2)",
          },
        });
        break;
      case "warning":
        toast(message, {
          icon: "⚠️",
          style: {
            background: "#1A1A1F",
            color: "#F5F5F5",
            border: "1px solid rgba(255, 210, 100, 0.2)",
          },
        });
        break;
      case "info":
      default:
        toast(message, {
          icon: "ℹ️",
          style: {
            background: "#1A1A1F",
            color: "#F5F5F5",
            border: "1px solid rgba(19, 173, 199, 0.2)",
          },
        });
        break;
    }
  }, []);

  const dismissToast = useCallback(() => {
    toast.dismiss();
  }, []);

  return { showToast, dismissToast };
} 