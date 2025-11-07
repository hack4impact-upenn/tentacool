import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "bg-sky-500 text-white hover:bg-sky-600 shadow-radial",
    destructive: "bg-red-500 text-white hover:bg-red-600 shadow-radial",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 shadow-radial",
    ghost: "hover:bg-gray-100",
    secondary: "bg-moss-500 text-white hover:bg-moss-600 shadow-radial",
  }
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10",
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }

