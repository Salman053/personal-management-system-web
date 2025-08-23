import { cn } from "@/lib/utils";
import { useState } from "react";

interface DateInputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  id?:string;
  name?:string
}

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  className,
  id,
  name,
}) => {
  return (
    <div className="relative ">
      <input
      id={id}
      name={name}
              type="date"
        value={value}
        onChange={onChange}
        className={cn(
          " md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30 border-input rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color, box-shadow] outline-none w-full aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
      />
    </div>
  );
};

export default DateInput;
