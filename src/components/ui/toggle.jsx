import * as React from "react"
import { cn } from "../../lib/utils"

const Toggle = React.forwardRef(({ className, pressed, onPressedChange, ...props }, ref) => {
  return (
    <button
      type="button"
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-sky-100 data-[state=on]:text-sky-900",
        pressed && "bg-sky-100 text-sky-900",
        className
      )}
      data-state={pressed ? "on" : "off"}
      onClick={() => onPressedChange?.(!pressed)}
      {...props}
    />
  )
})
Toggle.displayName = "Toggle"

export { Toggle }

