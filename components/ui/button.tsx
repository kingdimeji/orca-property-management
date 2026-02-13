import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-[#635bff] text-white hover:bg-[#0a2540] active:scale-[0.98] shadow-md hover:shadow-lg",
        destructive: "bg-[#df1b41] text-white hover:bg-[#c41638] active:scale-[0.98] shadow-md hover:shadow-lg",
        outline: "border-2 border-[#e3e8ef] bg-white text-[#0a2540] hover:bg-[#f7fafc] hover:border-[#cbd5e0] active:scale-[0.98]",
        secondary: "bg-[#f7fafc] text-[#0a2540] hover:bg-[#edf2f7] active:scale-[0.98]",
        ghost: "text-[#4a5568] hover:bg-[#f7fafc] hover:text-[#0a2540] active:scale-[0.98]",
        link: "text-[#635bff] underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 rounded-md px-3.5 text-xs",
        lg: "h-12 rounded-lg px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
