"use client";

import { toast } from "sonner";

type ToastType = "success" | "error" | "warning" | "info";

export const useToast = () => {
  const showToast = (
    message: string,
    type: ToastType = "info",
    options?: {
      duration?: number;
      action?: {
        label: string;
        onClick: () => void;
      };
    }
  ) => {
    const config = {
      duration: options?.duration || 4000,
      ...(options?.action && {
        action: {
          label: options.action.label,
          onClick: options.action.onClick,
        },
      }),
    };

    switch (type) {
      case "success":
        return toast.success(message, config);
      case "error":
        return toast.error(message, config);
      case "warning":
        return toast.warning(message, config);
      case "info":
        return toast.info(message, config);
      default:
        return toast(message, config);
    }
  };

  const showLoadingToast = (message: string, id?: string) => {
    return toast.loading(message, { id });
  };

  const updateToast = (
    id: string,
    message: string,
    type: ToastType = "success"
  ) => {
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
      default:
        toast(message, { id });
    }
  };

  const dismissToast = (id?: string) => {
    toast.dismiss(id);
  };

  return {
    toast: showToast,
    loading: showLoadingToast,
    update: updateToast,
    dismiss: dismissToast,
  };
};