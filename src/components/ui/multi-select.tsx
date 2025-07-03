
import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleUnselect = (item: string) => {
    onChange(selected.filter((s) => s !== item))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const input = e.target as HTMLInputElement
    if (e.key === "Delete" || e.key === "Backspace") {
      if (input.value === "" && selected.length > 0) {
        handleUnselect(selected[selected.length - 1])
      }
    }
    if (e.key === "Escape") {
      input.blur()
    }
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      const trimmedValue = inputValue.trim()
      if (!selected.includes(trimmedValue)) {
        onChange([...selected, trimmedValue])
      }
      setInputValue("")
    }
  }

  const selectables = options.filter(option => !selected.includes(option))
  const hasCustomOption = inputValue.trim() && !options.includes(inputValue.trim()) && !selected.includes(inputValue.trim())

  return (
    <Command onKeyDown={handleKeyDown} className={cn("overflow-visible bg-transparent", className)}>
      <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-col gap-2">
          {selected.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {selected.map((item) => {
                return (
                  <Badge key={item} variant="secondary">
                    {item}
                    <button
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUnselect(item)
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={() => handleUnselect(item)}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                )
              })}
            </div>
          )}
          <CommandInput
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="bg-transparent outline-none placeholder:text-muted-foreground flex-1 border-0 px-0"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && (selectables.length > 0 || hasCustomOption) ? (
          <div className="absolute w-full z-10 top-0 rounded-md border bg-white shadow-md outline-none animate-in">
            <CommandList>
              <CommandGroup className="h-full overflow-auto">
                {hasCustomOption && (
                  <CommandItem
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onSelect={() => {
                      const trimmedValue = inputValue.trim()
                      onChange([...selected, trimmedValue])
                      setInputValue("")
                    }}
                    className="cursor-pointer"
                  >
                    Add "{inputValue.trim()}"
                  </CommandItem>
                )}
                {selectables.map((option) => {
                  return (
                    <CommandItem
                      key={option}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onSelect={() => {
                        setInputValue("")
                        onChange([...selected, option])
                      }}
                      className={"cursor-pointer"}
                    >
                      {option}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </div>
        ) : null}
      </div>
    </Command>
  )
}
