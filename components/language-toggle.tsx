"use client"

import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={toggleLanguage}>
            <Languages className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">{language === "ar" ? "Switch to English" : "التبديل إلى العربية"}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{language === "ar" ? "Switch to English" : "التبديل إلى العربية"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
