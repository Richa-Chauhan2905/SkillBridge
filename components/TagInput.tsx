"use client";

import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  label: string;
  values: string[];
  setValues: (values: string[]) => void;
  placeholder?: string;
}

export default function TagInput({
  label,
  values,
  setValues,
  placeholder,
}: TagInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#1C1917]">{label}</label>

      <div className="flex flex-wrap items-center gap-2 rounded-md border bg-white px-2 py-2">
        {values.map((tag, index) => (
          <Badge
            key={index}
            className="flex items-center gap-1 bg-[#C2410C] text-white"
          >
            {tag}
            <X
              size={14}
              className="cursor-pointer"
              onClick={() =>
                setValues(values.filter((_, i) => i !== index))
              }
            />
          </Badge>
        ))}

        <input
          className="flex-1 border-none outline-none bg-transparent text-sm min-w-[120px]"
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              const value = e.currentTarget.value.trim();

              if (value && !values.includes(value)) {
                setValues([...values, value]);
              }
              e.currentTarget.value = "";
            }

            if (
              e.key === "Backspace" &&
              !e.currentTarget.value &&
              values.length
            ) {
              setValues(values.slice(0, -1));
            }
          }}
        />
      </div>
    </div>
  );
}
