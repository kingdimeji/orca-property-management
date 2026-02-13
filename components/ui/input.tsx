import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border-2 border-[#e3e8ef] bg-white px-4 py-2.5 text-sm font-medium text-[#0a2540] placeholder:text-[#a0aec0] placeholder:font-normal transition-all focus:outline-none focus:ring-2 focus:ring-[#635bff] focus:ring-offset-1 focus:border-[#635bff] hover:border-[#cbd5e0] disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f7fafc]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
