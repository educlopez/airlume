"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"

import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"

const MODELS = [
  { label: "GPT-4o (latest, fast)", value: "gpt-4o" },
  { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
  { label: "GPT-3.5 Turbo (cheap)", value: "gpt-3.5-turbo" },
  { label: "GPT-4.1 Nano (cheapest)", value: "gpt-4.1-nano-2025-04-14" },
]

export default function GeneratorPage() {
  const [prompt, setPrompt] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [model, setModel] = useState(MODELS[0].value)
  const [temperature, setTemperature] = useState(1)
  const [maxTokens, setMaxTokens] = useState(512)
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  // Advanced options
  const [systemPrompt, setSystemPrompt] = useState("")
  const [presencePenalty, setPresencePenalty] = useState(0)
  const [frequencyPenalty, setFrequencyPenalty] = useState(0)
  const [topP, setTopP] = useState(1)
  const { user } = useUser()
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [isLocalApiKey, setIsLocalApiKey] = useState(false)

  const isFormValid = prompt.trim() && (isLocalApiKey || apiKey.trim())

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const prefs =
        JSON.parse(localStorage.getItem("generatorPrefs") || "{}") || {}
      if (prefs.model) setModel(prefs.model)
      if (prefs.temperature !== undefined) setTemperature(prefs.temperature)
      if (prefs.maxTokens !== undefined) setMaxTokens(prefs.maxTokens)
      if (prefs.systemPrompt !== undefined) setSystemPrompt(prefs.systemPrompt)
      if (prefs.presencePenalty !== undefined)
        setPresencePenalty(prefs.presencePenalty)
      if (prefs.frequencyPenalty !== undefined)
        setFrequencyPenalty(prefs.frequencyPenalty)
      if (prefs.topP !== undefined) setTopP(prefs.topP)
      if (prefs.showAdvanced !== undefined) setShowAdvanced(prefs.showAdvanced)
    } catch {}
  }, [])

  // Save preferences to localStorage when they change (except apiKey, prompt, response, error, loading, copied)
  useEffect(() => {
    const prefs = {
      model,
      temperature,
      maxTokens,
      systemPrompt,
      presencePenalty,
      frequencyPenalty,
      topP,
      showAdvanced,
    }
    localStorage.setItem("generatorPrefs", JSON.stringify(prefs))
  }, [
    model,
    temperature,
    maxTokens,
    systemPrompt,
    presencePenalty,
    frequencyPenalty,
    topP,
    showAdvanced,
  ])

  useEffect(() => {
    // Detect if running in development and the env key is set (via a custom endpoint)
    async function checkLocalApiKey() {
      if (typeof window !== "undefined") {
        try {
          const res = await fetch("/api/generate", {
            method: "OPTIONS",
          })
          const data = await res.json()
          setIsLocalApiKey(Boolean(data.hasLocalApiKey))
        } catch {
          setIsLocalApiKey(false)
        }
      }
    }
    checkLocalApiKey()
  }, [])

  function isErrorWithMessage(err: unknown): err is { message: string } {
    return (
      typeof err === "object" &&
      err !== null &&
      "message" in err &&
      typeof (err as { message?: unknown }).message === "string"
    )
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setResponse("")
    setError("")
    setLoading(true)
    setCopied(false)
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          apiKey,
          model,
          temperature,
          maxTokens,
          systemPrompt,
          presencePenalty,
          frequencyPenalty,
          topP,
        }),
      })
      if (!res.body) throw new Error("No response body")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          const chunk = decoder.decode(value)
          // Vercel AI SDK data stream protocol: lines like 0:"text"
          // Only append lines starting with 0:
          const lines = chunk.split("\n")
          let textChunk = ""
          for (const line of lines) {
            if (line.startsWith("0:")) {
              // Remove 0: and parse the JSON string
              try {
                const text = JSON.parse(line.slice(2))
                textChunk += text
              } catch {
                // Fallback: just append the raw string
                textChunk += line.slice(2)
              }
            }
          }
          setResponse((prev) => prev + textChunk)
        }
      }
    } catch (err: unknown) {
      if (isErrorWithMessage(err)) {
        setError(err.message)
      } else {
        setError("Something went wrong")
      }
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function handleSave() {
    setSaveStatus(null)
    try {
      const { error } = await supabase.from("generations").insert([
        {
          user_id: user?.id,
          prompt,
          model,
          temperature,
          max_tokens: maxTokens,
          system_prompt: systemPrompt,
          presence_penalty: presencePenalty,
          frequency_penalty: frequencyPenalty,
          top_p: topP,
          response,
        },
      ])
      if (error) throw error
      setSaveStatus("Saved!")
    } catch (err: unknown) {
      if (isErrorWithMessage(err)) {
        setSaveStatus(err.message)
      } else {
        setSaveStatus("Failed to save")
      }
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Content Generator</h1>
      <form onSubmit={handleGenerate} className="space-y-6">
        <div>
          <label className="mb-1 block font-medium">
            Prompt <span className="text-red-500">*</span>
          </label>
          <textarea
            className="min-h-[80px] w-full rounded border p-2 focus:border-blue-400 focus:ring focus:outline-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
            placeholder="Describe what you want to generate..."
          />
        </div>
        {!isLocalApiKey && (
          <div>
            <label className="mb-1 block font-medium">
              OpenAI API Key <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type={showKey ? "text" : "password"}
                className="w-full rounded border p-2 focus:border-blue-400 focus:ring focus:outline-none"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                placeholder="sk-..."
                autoComplete="off"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowKey((v) => !v)}
                tabIndex={-1}
              >
                {showKey ? "Hide" : "Show"}
              </Button>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              <span>Your key is never stored. </span>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-600"
              >
                Where do I get this?
              </a>
            </div>
          </div>
        )}
        <div>
          <label className="mb-1 block font-medium">Model</label>
          <select
            className="w-full rounded border p-2 focus:border-blue-400 focus:ring focus:outline-none"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block font-medium">
              Temperature
              <span className="ml-1 text-xs text-gray-400">
                ({temperature})
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block font-medium">
              Max Tokens
              <span className="ml-1 text-xs text-gray-400">({maxTokens})</span>
            </label>
            <input
              type="range"
              min={64}
              max={4096}
              step={64}
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        {/* Advanced options toggle */}
        <div>
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? "Hide" : "Show"} Advanced Options
          </Button>
        </div>
        {showAdvanced && (
          <div className="mt-2 space-y-4 rounded border bg-gray-50 p-4">
            <div>
              <label className="mb-1 block font-medium">System Prompt</label>
              <input
                type="text"
                className="w-full rounded border p-2"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="e.g. You are a helpful assistant."
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="mb-1 block font-medium">
                  Presence Penalty
                  <span className="ml-1 text-xs text-gray-400">
                    ({presencePenalty})
                  </span>
                </label>
                <input
                  type="range"
                  min={-2}
                  max={2}
                  step={0.1}
                  value={presencePenalty}
                  onChange={(e) => setPresencePenalty(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block font-medium">
                  Frequency Penalty
                  <span className="ml-1 text-xs text-gray-400">
                    ({frequencyPenalty})
                  </span>
                </label>
                <input
                  type="range"
                  min={-2}
                  max={2}
                  step={0.1}
                  value={frequencyPenalty}
                  onChange={(e) => setFrequencyPenalty(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block font-medium">
                Top-p
                <span className="ml-1 text-xs text-gray-400">({topP})</span>
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={topP}
                onChange={(e) => setTopP(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}
        <Button
          type="submit"
          disabled={!isFormValid || loading}
          className="flex w-full items-center justify-center"
        >
          {loading && <span className="mr-2 animate-spin">⏳</span>}
          {loading ? "Generating..." : "Generate"}
        </Button>
        {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
      </form>
      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-semibold">Response</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!response}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
            {user && response && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSave}
              >
                Save
              </Button>
            )}
          </div>
        </div>
        <div className="min-h-[100px] rounded border bg-gray-100 p-4 whitespace-pre-wrap">
          {response || (
            <span className="text-gray-400">
              The generated content will appear here.
            </span>
          )}
        </div>
        {saveStatus && (
          <div className="mt-2 text-sm text-green-600">{saveStatus}</div>
        )}
      </div>
    </div>
  )
}
