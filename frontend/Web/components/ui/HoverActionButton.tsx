import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HoverActionButtonProps {
  label?: string;
  className?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export const HoverActionButton = ({
  label = "Button",
  className,
  onClick,
  icon,
}: HoverActionButtonProps = {}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className={cn(
        "group relative cursor-pointer overflow-hidden border border-neutral-700 bg-neutral-900 p-2 text-center font-semibold text-white select-none",
        className
      )}
    >
      <span className="inline-flex items-center justify-center gap-2 translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        {icon}
        {label}
      </span>

      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100">
        <span>{label}</span>
        <ArrowRight className="w-4 h-4" />
      </div>

      <div className="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] bg-transparent transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:bg-emerald-500 dark:group-hover:bg-emerald-700"></div>
    </div>
  );
};
