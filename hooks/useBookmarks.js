import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "crowdfund_bookmarks";

function getBookmarks() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const toggle = useCallback((campaignId) => {
    const id = String(campaignId);
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isBookmarked = useCallback((campaignId) => bookmarks.includes(String(campaignId)), [bookmarks]);

  return { bookmarks, toggle, isBookmarked };
}
