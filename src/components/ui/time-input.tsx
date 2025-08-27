import { cn } from "@/lib/utils";

interface TimeInputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  id?:string;
  name?:string
  disabled?:boolean
}

const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  className,
  disabled=false,
  id,
  name,
}) => {
  return (
    <div className="relative  w-full">
      <input
      id={id}
      name={name}
              type="time"
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={cn(
          " md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30 border-input rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color, box-shadow] outline-none w-full aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
      />
    </div>
  );
};

export default TimeInput;
