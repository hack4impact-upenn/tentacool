import * as React from "react"
import { cn } from "../../lib/utils"

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    jailbroken: "bg-red-100 text-red-800",
    safe: "bg-moss-100 text-moss-800",
    secondary: "bg-sky-100 text-sky-800",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }

