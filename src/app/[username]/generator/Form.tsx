"use client"

import { useEffect, useState, useTransition } from "react"
import Image from "next/image"
import { useUser } from "@clerk/nextjs"
import {
  AtSign,
  CheckCircle,
  FileText,
  Hash,
  Info,
  Link as LinkIcon,
  List,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"

import { saveGeneration } from "./actions"

const ALL_MODELS = [
  { label: "GPT-4o (latest, fast)", value: "gpt-4o" },
  { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
  { label: "GPT-3.5 Turbo (cheap)", value: "gpt-3.5-turbo" },
  { label: "GPT-4.1 Nano (cheapest)", value: "gpt-4.1-nano-2025-04-14" },
]
const NANO_MODEL = [
  { label: "GPT-4.1 Nano (cheapest)", value: "gpt-4.1-nano-2025-04-14" },
]

function getTweetMetrics(text: string) {
  const charCount = text.length
  const hashtags = (text.match(/#[\w]+/g) || []).length
  const mentions = (text.match(/@[\w]+/g) || []).length
  const links = (text.match(/https?:\/\//g) || []).length
  const isQuestion = text.trim().endsWith("?")
  const cta =
    /(dale like|comparte|sígueme|retweet|haz click|descubre|mira|comenta|opina|participa|únete|visita|lee|hazme saber|cuéntame|dime|responde|comparte tu opinión)/i.test(
      text
    )
  // Score simple: longitud ideal (80-120), hashtags (1-2), menciones (0-2), links (0-1), pregunta o CTA
  let score = 0
  if (charCount >= 80 && charCount <= 120) score += 30
  else if (charCount <= 280) score += 20
  if (hashtags === 1 || hashtags === 2) score += 20
  else if (hashtags > 0) score += 10
  if (mentions <= 2 && mentions > 0) score += 10
  if (links === 1) score += 10
  if (isQuestion) score += 10
  if (cta) score += 20
  if (score > 100) score = 100
  return { charCount, hashtags, mentions, links, isQuestion, cta, score }
}

export default function GeneratorForm({ userId }: { userId: string }) {
  const [prompt, setPrompt] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [model, setModel] = useState(ALL_MODELS[0].value)
  const [temperature] = useState(1)
  const [maxTokens] = useState(512)
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [showAdvanced] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState("")
  const [presencePenalty, setPresencePenalty] = useState(0)
  const [frequencyPenalty, setFrequencyPenalty] = useState(0)
  const [topP, setTopP] = useState(1)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [editedResponse, setEditedResponse] = useState("")
  const [hasUserKey, setHasUserKey] = useState<boolean | null>(null)
  const [isPending, startTransition] = useTransition()
  const [editMode, setEditMode] = useState(false)
  const [keyInput, setKeyInput] = useState("")
  const [keyActionLoading, setKeyActionLoading] = useState(false)
  const [keyError, setKeyError] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isEditingResponse, setIsEditingResponse] = useState(false)
  const [draftEditedResponse, setDraftEditedResponse] = useState("")

  const availableModels = hasUserKey ? ALL_MODELS : NANO_MODEL

  const isApiKeyValid = !apiKey || apiKey.startsWith("sk-")
  const isFormValid = prompt.trim() && isApiKeyValid

  const { user } = useUser()
  const username = user?.username || ""
  const displayName =
    user?.fullName || user?.username || user?.firstName || "User"
  const avatarUrl = user?.imageUrl || ""

  // Prompt maestro por defecto
  const TWEET_SYSTEM_PROMPT =
    "You&apos;re a Twitter expert. Write an engaging, clear, and direct tweet that adheres to the 280-character limit, uses good formatting, relevant hashtags, and mentions if applicable. The result should be just the text of the tweet, without quotes or explanations."

  // Si el usuario no ha tocado systemPrompt, forzar el maestro
  useEffect(() => {
    if (!showAdvanced && systemPrompt !== TWEET_SYSTEM_PROMPT) {
      setSystemPrompt(TWEET_SYSTEM_PROMPT)
    }
  }, [showAdvanced, systemPrompt])

  useEffect(() => {
    async function checkUserKey() {
      try {
        const res = await fetch("/api/user-openai-key")
        const data = await res.json()
        setHasUserKey(Boolean(data.hasKey))
        if (data.hasKey) {
          setApiKey("") // never keep key in state
          setModel(ALL_MODELS[0].value)
        } else {
          setModel(NANO_MODEL[0].value)
        }
      } catch {
        setHasUserKey(false)
        setModel(NANO_MODEL[0].value)
      }
    }
    async function checkEnvKey() {
      try {
        await fetch("/api/generate", { method: "OPTIONS" })
      } catch {
        // setHasEnvKey(false) // removed unused setter
      }
    }
    checkUserKey()
    checkEnvKey()
  }, [])

  useEffect(() => {
    setEditedResponse(response)
  }, [response])

  useEffect(() => {
    if (!hasUserKey) {
      setKeyInput("")
      setEditMode(false)
    }
  }, [hasUserKey])

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
    setLoading(true)
    try {
      if (!hasUserKey && apiKey && apiKey.startsWith("sk-")) {
        const res = await fetch("/api/user-openai-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ openai_key: apiKey }),
        })
        if (res.ok) {
          setHasUserKey(true)
        }
      }
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
          const lines = chunk.split("\n")
          let textChunk = ""
          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const text = JSON.parse(line.slice(2))
                textChunk += text
              } catch {
                textChunk += line.slice(2)
              }
            }
          }
          setResponse((prev) => prev + textChunk)
        }
      }
    } catch (err: unknown) {
      if (isErrorWithMessage(err)) {
        // setError(err.message) // removed unused setter
      } else {
        // setError("Something went wrong") // removed unused setter
      }
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(editedResponse)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveStatus(null)
    startTransition(async () => {
      try {
        await saveGeneration({
          userId,
          prompt,
          model,
          temperature,
          maxTokens,
          systemPrompt,
          presencePenalty,
          frequencyPenalty,
          topP,
          response: editedResponse,
          imageFile: imageFile || undefined,
        })
        setSaveStatus("Saved!")
      } catch {
        setSaveStatus("Failed to save")
      }
    })
  }

  async function handleSaveKey(e: React.FormEvent) {
    e.preventDefault()
    setKeyActionLoading(true)
    setKeyError("")
    try {
      if (!keyInput.startsWith("sk-")) {
        setKeyError("API Key must start with &apos;sk-&apos;")
        setKeyActionLoading(false)
        return
      }
      const res = await fetch("/api/user-openai-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openai_key: keyInput }),
      })
      if (!res.ok) throw new Error("Failed to save key")
      setHasUserKey(true)
      setEditMode(false)
      setKeyInput("")
      toast.success("Your OpenAI API key has been saved.")
    } catch {
      setKeyError("Failed to save key")
      toast.error("Failed to save API key.")
    } finally {
      setKeyActionLoading(false)
    }
  }

  async function handleDeleteKey() {
    setKeyActionLoading(true)
    setKeyError("")
    try {
      const res = await fetch("/api/user-openai-key", { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete key")
      setHasUserKey(false)
      setKeyInput("")
      setEditMode(false)
      toast.success("Your OpenAI API key has been deleted.")
    } catch (err) {
      setKeyError("Failed to delete key")
      console.log(err)
      toast.error("Failed to delete API key.")
    } finally {
      setKeyActionLoading(false)
    }
  }

  const metrics = getTweetMetrics(editedResponse)

  // Wrappers para pasar a MetricsPanel sin argumentos
  function handleCopyNoArgs() {
    handleCopy()
  }
  function handleSaveNoArgs() {
    handleSave({} as unknown as React.FormEvent)
  }

  return (
    <div className="relative mx-auto flex h-[90vh] w-full flex-row gap-8">
      {/* Columna izquierda: contenido central */}
      <div className="relative flex flex-1 flex-col items-center">
        {/* Card de API Key centrada arriba */}
        <Card className="shadow-custom mb-6 flex w-full max-w-lg flex-col items-start gap-6 border-none p-4">
          <div className="font-semibold">OpenAI API Key</div>
          <div className="text-foreground/70 text-xs">
            To unlock more models for content generation, add your own OpenAI
            API key.
          </div>
          {hasUserKey && !editMode ? (
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
              <div className="text-sm text-green-700">
                Your OpenAI API key is set. All models are available.
              </div>
              <div className="mt-2 flex gap-2 md:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  disabled={keyActionLoading}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteKey}
                  disabled={keyActionLoading}
                >
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <form
              className="flex flex-row gap-2 md:items-center md:gap-4"
              onSubmit={handleSaveKey}
            >
              <Input
                type={showKey ? "text" : "password"}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="sk-..."
                autoComplete="off"
                disabled={keyActionLoading}
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowKey((v) => !v)}
                tabIndex={-1}
                size="sm"
              >
                {showKey ? "Hide" : "Show"}
              </Button>
              <Button
                type="submit"
                variant="custom"
                size="sm"
                disabled={keyActionLoading || !keyInput.startsWith("sk-")}
              >
                Save
              </Button>

              {hasUserKey && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(false)}
                  disabled={keyActionLoading}
                >
                  Cancel
                </Button>
              )}
            </form>
          )}
          {keyError && (
            <div className="mt-1 text-xs text-red-500">{keyError}</div>
          )}
        </Card>
        {/* Área central con Card y tweet generado o placeholder */}
        <Card className="shadow-custom flex w-full max-w-lg flex-col items-center gap-6 border-none p-8">
          {editedResponse ? (
            <div className="flex w-full items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback>{displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{displayName}</span>
                  <span className="text-muted-foreground text-sm">
                    @{username}
                  </span>
                </div>
                <div className="mt-2 text-lg whitespace-pre-line">
                  {isEditingResponse ? (
                    <>
                      <Textarea
                        className="min-h-[80px] w-full border p-2 text-lg focus:border-blue-400 focus:ring focus:outline-none"
                        value={draftEditedResponse}
                        onChange={(e) => setDraftEditedResponse(e.target.value)}
                        autoFocus
                      />
                      <div className="mt-2 flex gap-2">
                        <Button
                          type="button"
                          variant="custom"
                          size="sm"
                          onClick={() => {
                            setEditedResponse(draftEditedResponse)
                            setIsEditingResponse(false)
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditingResponse(false)
                            setDraftEditedResponse(editedResponse)
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      {editedResponse}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-2 px-2 py-1 text-xs"
                        onClick={() => {
                          setIsEditingResponse(true)
                          setDraftEditedResponse(editedResponse)
                        }}
                      >
                        Edit
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground w-full py-12 text-center text-lg">
              Your generated post will appear here. Write a prompt below and
              click Generate!
            </div>
          )}
          {editedResponse && (
            <div
              className={cn(
                "mt-4 flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors",
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-gray-300 bg-transparent"
              )}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setIsDragging(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                const file = e.dataTransfer.files?.[0]
                if (file && file.type.startsWith("image/")) setImageFile(file)
              }}
            >
              <label className="text-foreground w-full cursor-pointer text-center text-sm font-medium">
                Add an image (optional)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setImageFile(file)
                  }}
                  className="hidden"
                />
              </label>
              <span className="text-foreground text-xs">
                Drag & drop or click to select an image
              </span>
              {imageFile && (
                <div className="mt-2 flex flex-col items-center gap-2">
                  <Image
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="max-h-40 rounded-lg border"
                    width={160}
                    height={160}
                  />
                  <button
                    type="button"
                    className="text-xs text-red-500 underline"
                    onClick={() => setImageFile(null)}
                  >
                    Remove image
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>
        {/* Barra de acciones inferior fixed respecto al contenido */}
        <div className="absolute bottom-2 left-1/2 w-full max-w-xl -translate-x-1/2">
          <form
            onSubmit={handleGenerate}
            className="shadow-custom bg-background flex flex-col items-end gap-2 rounded-xl border border-none p-4"
          >
            <Textarea
              className="min-h-[48px] w-full flex-1 resize-none rounded border p-2 text-lg focus:border-blue-400 focus:ring focus:outline-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Write about your post..."
              required
            />
            <div className="flex w-full flex-row items-center gap-2">
              <Select
                value={model}
                onValueChange={setModel}
                disabled={availableModels.length === 1}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      availableModels.find((m) => m.value === model)?.label
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="text-xs">
                    <Info className="mr-1 size-4" />
                    Advanced
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Advanced options</DialogTitle>
                    <DialogDescription>
                      Adjust the models advanced parameters.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-2 space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="mb-1 block font-medium">
                          Presence Penalty{" "}
                          <span className="ml-1 text-xs text-gray-400">
                            ({presencePenalty})
                          </span>
                        </label>
                        <Slider
                          min={-2}
                          max={2}
                          step={0.1}
                          value={[presencePenalty]}
                          onValueChange={([v]) => setPresencePenalty(v)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block font-medium">
                          Frequency Penalty{" "}
                          <span className="ml-1 text-xs text-gray-400">
                            ({frequencyPenalty})
                          </span>
                        </label>
                        <Slider
                          min={-2}
                          max={2}
                          step={0.1}
                          value={[frequencyPenalty]}
                          onValueChange={([v]) => setFrequencyPenalty(v)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block font-medium">
                        Top-p{" "}
                        <span className="ml-1 text-xs text-gray-400">
                          ({topP})
                        </span>
                      </label>
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={[topP]}
                        onValueChange={([v]) => setTopP(v)}
                      />
                    </div>
                  </div>
                  <DialogClose asChild>
                    <Button variant="outline" className="mt-4 w-full">
                      Close
                    </Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
              <Button
                type="submit"
                variant="custom"
                disabled={!isFormValid || loading}
                className="flex items-center justify-center"
              >
                {loading && <span className="mr-2 animate-spin">⏳</span>}
                {loading ? "Generating..." : "Generate"}
              </Button>
              {editedResponse && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSave}
                  disabled={isPending}
                >
                  {isPending ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
      {/* Columna derecha: panel de métricas */}
      <div className="relative top-0 right-0 hidden h-full w-96 md:block">
        <Card className="shadow-custom flex h-full w-full flex-col overflow-y-auto border-none p-4">
          {editedResponse ? (
            <MetricsPanel
              metrics={metrics}
              onCopy={handleCopyNoArgs}
              onSave={handleSaveNoArgs}
              isPending={isPending}
              response={editedResponse}
              saveStatus={saveStatus}
            />
          ) : (
            <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center px-4 text-center">
              <h3 className="mb-2 text-xl font-semibold">Metrics Panel</h3>
              <p className="mb-4">
                Here you will see the analysis and score of your generated post.
              </p>
              <ul className="mb-2 list-inside list-disc text-left text-sm">
                <li>Post length</li>
                <li>Number of hashtags and mentions</li>
                <li>Link detection</li>
                <li>Optimization score</li>
                <li>Tips to improve your post</li>
              </ul>
              <span className="text-xs text-gray-400">
                Generate a post to see your metrics here.
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function MetricsPanel({
  metrics,
  onCopy,
  onSave,
  isPending,
  response,
  saveStatus,
}: {
  metrics: ReturnType<typeof getTweetMetrics>
  onCopy: () => void
  onSave: () => void
  isPending: boolean
  response: string
  saveStatus: string | null
}) {
  const scoreColor =
    metrics.score > 80
      ? "text-green-500"
      : metrics.score > 50
        ? "text-yellow-500"
        : "text-red-500"
  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Gauge Score */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative flex items-center justify-center">
          {/* SVG Gauge */}
          <svg width="120" height="60" viewBox="0 0 120 60">
            <path
              d="M10,60 A50,50 0 0,1 110,60"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            <path
              d="M10,60 A50,50 0 0,1 110,60"
              fill="none"
              stroke={
                metrics.score > 80
                  ? "#22c55e"
                  : metrics.score > 50
                    ? "#eab308"
                    : "#ef4444"
              }
              strokeWidth="12"
              strokeDasharray={157}
              strokeDashoffset={157 - (metrics.score / 100) * 157}
              strokeLinecap="round"
            />
            <text
              x="60"
              y="58"
              textAnchor="middle"
              fontSize="32"
              fontWeight="bold"
              fill="currentColor"
              className={scoreColor}
            >
              {metrics.score}
            </text>
          </svg>
        </div>
        <div className="text-muted-foreground text-xs">Post Score</div>
      </div>
      {/* Métricas detalladas */}
      <div className="bg-primary shadow-custom flex flex-col gap-3 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <FileText className="text-foreground/70 size-4" />{" "}
          <span className="flex-1">Characters</span>{" "}
          <span className="font-semibold">{metrics.charCount} / 280</span>
        </div>
        <div className="flex items-center gap-2">
          <Hash className="text-foreground/70 size-4" />{" "}
          <span className="flex-1">Hashtags</span>{" "}
          <span className="font-semibold">{metrics.hashtags}</span>
        </div>
        <div className="flex items-center gap-2">
          <AtSign className="text-foreground/70 size-4" />{" "}
          <span className="flex-1">Mentions</span>{" "}
          <span className="font-semibold">{metrics.mentions}</span>
        </div>
        <div className="flex items-center gap-2">
          <LinkIcon className="text-foreground/70 size-4" />{" "}
          <span className="flex-1">Links</span>{" "}
          <span className="font-semibold">{metrics.links}</span>
        </div>
        <div className="flex items-center gap-2">
          <Info className="text-foreground/70 size-4" />{" "}
          <span className="flex-1">Question</span>{" "}
          <span className="font-semibold">
            {metrics.isQuestion ? (
              <CheckCircle className="inline size-4 text-green-500" />
            ) : (
              "No"
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <List className="text-foreground/70 size-4" />{" "}
          <span className="flex-1">CTA</span>{" "}
          <span className="font-semibold">
            {metrics.cta ? (
              <CheckCircle className="inline size-4 text-green-500" />
            ) : (
              "No"
            )}
          </span>
        </div>
      </div>
      {/* Acciones */}
      <div className="mt-2 flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onCopy()}
          disabled={!response}
        >
          Copy
        </Button>
        <Button
          type="button"
          variant="custom"
          size="sm"
          onClick={() => onSave()}
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
      {saveStatus && (
        <div className="mt-1 text-xs text-green-600">{saveStatus}</div>
      )}
    </div>
  )
}
