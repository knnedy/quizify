"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  initialRating?: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  initialRating = 0,
  onRatingChange,
  disabled = false,
  size = "md",
}: StarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (value: number) => {
    if (disabled) return;
    setRating(value);
    onRatingChange(value);
  };

  const handleMouseEnter = (value: number) => {
    if (disabled) return;
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverRating(0);
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hoverRating || rating);
        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            className={cn(
              "transition-colors duration-150",
              disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:scale-110"
            )}>
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors duration-150",
                isActive
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
