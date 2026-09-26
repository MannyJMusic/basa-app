"use client"

import { useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Slide-in navigation for screens too narrow for a sidebar. Render the trigger
 * where the menu button belongs and hide it from the breakpoint at which the
 * sidebar appears (e.g. `triggerClassName="lg:hidden"`). Following a link inside
 * closes the drawer.
 */
export function NavDrawer({
  title,
  triggerClassName,
  children,
}: {
  title: string
  triggerClassName?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button variant="outline" size="sm" className={cn("shrink-0", triggerClassName)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col overflow-y-auto border-r border-gray-200 bg-white shadow-lg focus:outline-hidden dark:border-gray-800 dark:bg-gray-900"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false)
          }}
        >
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
            <DialogPrimitive.Title className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="sm" aria-label="Close menu">
                <X className="h-5 w-5" />
              </Button>
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
