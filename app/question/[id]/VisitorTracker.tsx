"use client";
import { useEffect } from "react";

export default function VisitorTracker({ questionId }: { questionId: string }) {
  useEffect(() => {
    fetch(`/api/questions/${questionId}/visit`, { method: "POST" }).catch(
      () => {}
    );
  }, [questionId]);

  return null;
}