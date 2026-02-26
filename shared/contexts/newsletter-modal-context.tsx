"use client";

import { NewsletterSubscribeModal } from "@/shared/components/common/newsletter-subscribe-modal";
import React, { createContext, useCallback, useContext, useState } from "react";

type NewsletterModalContextValue = {
  openNewsletterModal: () => void;
};

const NewsletterModalContext = createContext<NewsletterModalContextValue | null>(null);

export function NewsletterModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openNewsletterModal = useCallback(() => setOpen(true), []);

  return (
    <NewsletterModalContext.Provider value={{ openNewsletterModal }}>
      {children}
      <NewsletterSubscribeModal open={open} onOpenChange={setOpen} />
    </NewsletterModalContext.Provider>
  );
}

export function useNewsletterModal(): NewsletterModalContextValue {
  const ctx = useContext(NewsletterModalContext);
  if (!ctx) {
    throw new Error("useNewsletterModal must be used within NewsletterModalProvider");
  }
  return ctx;
}
