"use client"
import { Toaster as Sonner } from "sonner"
import { useTheme } from "@/hooks/use-theme"
type ToasterProps = React.ComponentProps<typeof Sonner>
const Toaster = ({ ...props }: ToasterProps) => {
  const { isDark } = useTheme()
  const theme = isDark ? 'dark' : 'light';
  return (
    <>
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton:
              "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton:
              "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          },
        }}
        {...props}
      />
      <div className="fixed bottom-0 right-0 p-4 text-xs text-muted-foreground z-[9999]">
        Please note: AI-powered features are subject to usage limits.
      </div>
    </>
  )
}
export { Toaster }