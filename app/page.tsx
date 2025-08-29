"use client"

import { useState, useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function Page() {
  const [referenceText, setReferenceText] = useState(
    "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for typing practice.",
  )
  const [text, setText] = useState("")
  const [charactersPerMinute, setCharactersPerMinute] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [correctChars, setCorrectChars] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (text.length === 0) {
      setCharactersPerMinute(0)
      setAccuracy(100)
      setCorrectChars(0)
      setIsTyping(false)
      startTimeRef.current = null
      return
    }

    // Start timing on first character
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now()
    }

    setIsTyping(true)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set timeout to stop counting after 2 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 2000)

    let correct = 0
    for (let i = 0; i < text.length; i++) {
      if (i < referenceText.length && text[i] === referenceText[i]) {
        correct++
      }
    }
    setCorrectChars(correct)
    const accuracyPercent = text.length > 0 ? Math.round((correct / text.length) * 100) : 100
    setAccuracy(accuracyPercent)

    // Calculate CPM
    const currentTime = Date.now()
    const timeElapsed = (currentTime - startTimeRef.current) / 1000 / 60 // Convert to minutes
    const cpm = timeElapsed > 0 ? Math.round(text.length / timeElapsed) : 0
    setCharactersPerMinute(cpm)

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [text, referenceText])

  const handleTextChange = (value: string) => {
    setText(value)
  }

  const resetCounter = () => {
    setText("")
    setCharactersPerMinute(0)
    setAccuracy(100)
    setCorrectChars(0)
    setIsTyping(false)
    startTimeRef.current = null
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  const renderTextWithHighlighting = () => {
    return referenceText.split("").map((char, index) => {
      let className = "text-muted-foreground"

      if (index < text.length) {
        className = text[index] === char ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
      } else if (index === text.length) {
        className = "text-foreground bg-blue-100 border-l-2 border-blue-500"
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      )
    })
  }

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Typing Speed & Accuracy Test</h1>
          <p className="text-muted-foreground">Type the text below to measure your speed and accuracy</p>
        </div>

        <div>
          <div className="pb-4">
            <div>Reference Text</div>
          </div>
          <div>
            <div className="p-4 bg-muted rounded-lg font-mono text-sm leading-relaxed">
              {renderTextWithHighlighting()}
            </div>
          </div>
        </div>

        <div>
          <div className="pb-4">
            <div className="flex items-center justify-between">
              <span>Type Here</span>
              <div className="flex items-center gap-2">
                <Badge variant={isTyping ? "default" : "secondary"}>{isTyping ? "Typing..." : "Idle"}</Badge>
                <Button onClick={resetCounter} variant="outline" size="sm">
                  Reset
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Start typing the reference text above..."
              className="min-h-32 resize-none text-base leading-relaxed font-mono"
              autoFocus
            />

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Characters: {text.length} / {referenceText.length}
              </span>
              <span>Progress: {Math.round((text.length / referenceText.length) * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="pt-6">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-primary">{charactersPerMinute}</div>
                <div className="text-sm text-muted-foreground">Characters/min</div>
              </div>
            </div>
          </div>

          <div>
            <div className="pt-6">
              <div className="text-center space-y-2">
                <div
                  className={`text-3xl font-bold ${accuracy >= 95 ? "text-green-600" : accuracy >= 80 ? "text-yellow-600" : "text-red-600"}`}
                >
                  {accuracy}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </div>

          <div>
            <div className="pt-6">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-blue-600">{correctChars}</div>
                <div className="text-sm text-muted-foreground">Correct chars</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
