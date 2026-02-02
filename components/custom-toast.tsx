"use client";

import { toast } from "sonner";

export const CustomToast = {
  success: (message: string, options?: any) => {
    toast.success(message, {
      duration: 4000,
      ...options,
    });
  },
  
  error: (message: string, options?: any) => {
    toast.error(message, {
      duration: 5000,
      ...options,
    });
  },
  
  warning: (message: string, options?: any) => {
    toast.warning(message, {
      duration: 4000,
      ...options,
    });
  },
  
  info: (message: string, options?: any) => {
    toast.info(message, {
      duration: 3000,
      ...options,
    });
  },
  
  loading: (message: string, options?: any) => {
    return toast.loading(message, options);
  },
  
  dismiss: (id?: string) => {
    toast.dismiss(id);
  },
  
  update: (id: string, message: string, type: "success" | "error" | "warning" | "info") => {
    switch (type) {
      case "success":
        toast.success(message, { id });
        break;
      case "error":
        toast.error(message, { id });
        break;
      case "warning":
        toast.warning(message, { id });
        break;
      case "info":
        toast.info(message, { id });
        break;
    }
  },
};