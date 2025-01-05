'use client'

import * as React from "react"
import NextLink from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LinkProps extends React.ComponentPropsWithoutRef<typeof NextLink> {
  isLoading?: boolean
  loadingClassName?: string
  children: React.ReactNode
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, isLoading = false, loadingClassName, children, ...props }, ref) => {
    const [isNavigating, setIsNavigating] = React.useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()

    React.useEffect(() => {
      setIsNavigating(false)
    }, [pathname, searchParams])

    const isLoadingState = isLoading || isNavigating

    return (
      <NextLink
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center",
          isLoadingState && "cursor-not-allowed opacity-50",
          className
        )}
        onClick={() => setIsNavigating(true)}
        {...props}
      >
        {isLoadingState && (
          <Loader2 className={cn("mr-2 h-4 w-4 animate-spin", loadingClassName)} />
        )}
        {children}
      </NextLink>
    )
  }
)
Link.displayName = "Link"

export { Link } 