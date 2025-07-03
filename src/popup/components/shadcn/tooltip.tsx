import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

const TooltipProvider = ({ children, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) => (
  <TooltipPrimitive.Provider delayDuration={0} {...props}>
    {children}
  </TooltipPrimitive.Provider>
)

const Tooltip = ({ children, ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) => (
  <TooltipPrimitive.Root delayDuration={0} {...props}>
    {children}
  </TooltipPrimitive.Root>
)

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    side="top"
    align="center"
    avoidCollisions={true}
    collisionBoundary={document.body}
    style={{
      zIndex: 1000,
      borderRadius: "4px",
      background: "#1E1E1E",
      border: "1px solid #3C3C3C",
      padding: "4px 8px",
      fontSize: "12px",
      color: "#FFFFFF",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
      maxWidth: "200px",
      wordWrap: "break-word",
      lineHeight: "1.3",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } 