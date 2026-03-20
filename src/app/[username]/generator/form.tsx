"use client";

import { useUser } from "@clerk/nextjs";
import {
  Atom,
  AtSign,
  Check,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Hash,
  Info,
  Link as LinkIcon,
  List,
  Pencil,
  Save,
  Settings,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import Loading from "@/components/icons/loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import MediaLibraryPicker from "../posts/media-library-picker";
import { saveGeneration } from "./actions";

const ALL_MODELS = [
  { label: "GPT-4o (latest, fast)", value: "gpt-4o" },
  { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
  { label: "GPT-3.5 Turbo (cheap)", value: "gpt-3.5-turbo" },
  { label: "GPT-4.1 Nano (cheapest)", value: "gpt-4.1-nano-2025-04-14" },
];
const NANO_MODEL = [
  { label: "GPT-4.1 Nano (cheapest)", value: "gpt-4.1-nano-2025-04-14" },
];

const CTA_REGEX =
  /(dale like|comparte|sígueme|retweet|haz click|descubre|mira|comenta|opina|participa|únete|visita|lee|hazme saber|cuéntame|dime|responde|comparte tu opinión)/i;

function getTweetMetrics(text: string) {
  const charCount = text.length;
  const hashtags = (text.match(/#[\w]+/g) || []).length;
  const mentions = (text.match(/@[\w]+/g) || []).length;
  const links = (text.match(/https?:\/\//g) || []).length;
  const isQuestion = text.trim().endsWith("?");
  const cta = CTA_REGEX.test(text);
  // Score simple: longitud ideal (80-120), hashtags (1-2), menciones (0-2), links (0-1), pregunta o CTA
  let score = 0;
  if (charCount >= 80 && charCount <= 120) {
    score += 30;
  } else if (charCount <= 280) {
    score += 20;
  }
  if (hashtags === 1 || hashtags === 2) {
    score += 20;
  } else if (hashtags > 0) {
    score += 10;
  }
  if (mentions <= 2 && mentions > 0) {
    score += 10;
  }
  if (links === 1) {
    score += 10;
  }
  if (isQuestion) {
    score += 10;
  }
  if (cta) {
    score += 20;
  }
  if (score > 100) {
    score = 100;
  }
  return { charCount, hashtags, mentions, links, isQuestion, cta, score };
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: large form component with many states
export default function GeneratorForm({ userId }: { userId: string }) {
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(ALL_MODELS[0].value);
  const [temperature] = useState(1);
  const [maxTokens] = useState(512);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdvanced] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [presencePenalty, setPresencePenalty] = useState(0);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0);
  const [topP, setTopP] = useState(1);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileError, setImageFileError] = useState<string | null>(null);
  const [editedResponse, setEditedResponse] = useState("");
  const [hasUserKey, setHasUserKey] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();
  const [editMode, setEditMode] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keyActionLoading, setKeyActionLoading] = useState(false);
  const [keyError, setKeyError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [draftEditedResponse, setDraftEditedResponse] = useState("");
  const [imageUrlFromLibrary, setImageUrlFromLibrary] = useState<string | null>(
    null
  );
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);

  const availableModels = hasUserKey ? ALL_MODELS : NANO_MODEL;

  const isApiKeyValid = !apiKey || apiKey.startsWith("sk-");
  const isFormValid = prompt.trim() && isApiKeyValid;

  const { user } = useUser();
  const username = user?.username || "";
  const displayName =
    user?.fullName || user?.username || user?.firstName || "User";
  const avatarUrl = user?.imageUrl || "";

  // Prompt maestro por defecto
  const TWEET_SYSTEM_PROMPT =
    "You&apos;re a Twitter expert. Write an engaging, clear, and direct tweet that adheres to the 280-character limit, uses good formatting, relevant hashtags, and mentions if applicable. The result should be just the text of the tweet, without quotes or explanations.";

  // Si el usuario no ha tocado systemPrompt, forzar el maestro
  useEffect(() => {
    if (!showAdvanced && systemPrompt !== TWEET_SYSTEM_PROMPT) {
      setSystemPrompt(TWEET_SYSTEM_PROMPT);
    }
  }, [showAdvanced, systemPrompt]);

  useEffect(() => {
    async function checkUserKey() {
      try {
        const res = await fetch("/api/user-openai-key");
        const data = await res.json();
        const hasKey = Boolean(data.hasKey);
        setHasUserKey(hasKey);
        if (hasKey) {
          setApiKey(""); // never keep key in state
          setModel(ALL_MODELS[0].value);
          setApiKeyDialogOpen(false);
        } else {
          setModel(NANO_MODEL[0].value);
          // Abrir el modal automáticamente si no tiene clave
          setApiKeyDialogOpen(true);
        }
      } catch {
        setHasUserKey(false);
        setModel(NANO_MODEL[0].value);
        setApiKeyDialogOpen(true);
      }
    }
    checkUserKey();
  }, []);

  useEffect(() => {
    setEditedResponse(response);
  }, [response]);

  useEffect(() => {
    if (hasUserKey) {
      // Si tiene clave, cerrar el modal
      setApiKeyDialogOpen(false);
    } else {
      setKeyInput("");
      setEditMode(false);
      // Si no tiene clave y el modal no está abierto, abrirlo
      if (hasUserKey === false) {
        setApiKeyDialogOpen(true);
      }
    }
  }, [hasUserKey]);

  function isErrorWithMessage(err: unknown): err is { message: string } {
    return (
      typeof err === "object" &&
      err !== null &&
      "message" in err &&
      typeof (err as { message?: unknown }).message === "string"
    );
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setResponse("");
    setLoading(true);
    try {
      if (!hasUserKey && apiKey && apiKey.startsWith("sk-")) {
        const res = await fetch("/api/user-openai-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ openai_key: apiKey }),
        });
        if (res.ok) {
          setHasUserKey(true);
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
      });
      if (!res.body) {
        throw new Error("No response body");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          setResponse((prev) => prev + chunk);
        }
      }
    } catch (err: unknown) {
      if (isErrorWithMessage(err)) {
        // setError(err.message) // removed unused setter
      } else {
        // setError("Something went wrong") // removed unused setter
      }
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(editedResponse);
  }

  function handleSave(e?: React.FormEvent) {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    setSaveStatus(null);
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
          imageUrl: imageUrlFromLibrary || undefined,
        });
        setSaveStatus("Saved!");
        toast.success("Post Saved!");
      } catch {
        setSaveStatus("Failed to save");
        toast.error("Failed to save the post");
      }
    });
  }

  async function handleSaveKey(e: React.FormEvent) {
    e.preventDefault();
    setKeyActionLoading(true);
    setKeyError("");
    try {
      if (!keyInput.startsWith("sk-")) {
        setKeyError("API Key must start with &apos;sk-&apos;");
        setKeyActionLoading(false);
        return;
      }
      const res = await fetch("/api/user-openai-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openai_key: keyInput }),
      });
      if (!res.ok) {
        throw new Error("Failed to save key");
      }
      setHasUserKey(true);
      setEditMode(false);
      setKeyInput("");
      setApiKeyDialogOpen(false); // Cerrar el modal cuando se guarda la clave
      toast.success("Your OpenAI API key has been saved.");
    } catch {
      setKeyError("Failed to save key");
      toast.error("Failed to save API key.");
    } finally {
      setKeyActionLoading(false);
    }
  }

  async function handleDeleteKey() {
    setKeyActionLoading(true);
    setKeyError("");
    try {
      const res = await fetch("/api/user-openai-key", { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete key");
      }
      setHasUserKey(false);
      setKeyInput("");
      setEditMode(false);
      toast.success("Your OpenAI API key has been deleted.");
    } catch (err) {
      setKeyError("Failed to delete key");
      console.log(err);
      toast.error("Failed to delete API key.");
    } finally {
      setKeyActionLoading(false);
    }
  }

  const metrics = getTweetMetrics(editedResponse);

  // Wrappers para pasar a MetricsPanel sin argumentos
  function handleCopyNoArgs() {
    handleCopy();
  }
  function handleSaveNoArgs() {
    handleSave();
  }

  // Extracted OpenAI API Key Card as a function for modal use
  function OpenAIApiKeyCard() {
    const isRequired = hasUserKey === false;

    return (
      <Card className="flex w-full flex-col items-start gap-6 border-none p-4 shadow-none">
        {isRequired ? (
          <DialogHeader>
            <DialogTitle>OpenAI API Key Required</DialogTitle>
            <DialogDescription>
              You need to add your OpenAI API key to generate posts. This is
              required to use the content generator.
            </DialogDescription>
          </DialogHeader>
        ) : (
          <div className="font-semibold">OpenAI API Key</div>
        )}
        {isRequired && (
          <div className="text-foreground/70 text-sm">
            To generate content, you must add your own OpenAI API key. Without
            it, you cannot use the generator. Please add your key below to
            continue.
          </div>
        )}
        {!isRequired && (
          <div className="text-foreground/70 text-xs">
            To unlock more models for content generation, add your own OpenAI
            API key.
          </div>
        )}
        {hasUserKey && !editMode ? (
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <div className="text-airlume text-sm">
              <Check className="h-4 w-4" /> Your OpenAI API key is set. All
              models are available.
            </div>
            <div className="mt-2 flex gap-2 md:mt-0">
              <Button
                disabled={keyActionLoading}
                onClick={() => setEditMode(true)}
                size="sm"
                variant="outline"
              >
                Edit
              </Button>
              <Button
                disabled={keyActionLoading}
                onClick={handleDeleteKey}
                size="sm"
                variant="destructive"
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
            <div className="flex w-full max-w-sm items-center space-x-0">
              <Input
                autoComplete="off"
                className="rounded-tr-none rounded-br-none"
                disabled={keyActionLoading}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="sk-..."
                type={showKey ? "text" : "password"}
                value={keyInput}
              />
              <Button
                className="rounded-tl-none rounded-bl-none"
                onClick={() => setShowKey((v) => !v)}
                tabIndex={-1}
                type="button"
                variant="outline"
              >
                {showKey ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
            </div>
            <Button
              disabled={keyActionLoading || !keyInput.startsWith("sk-")}
              size="sm"
              type="submit"
              variant="custom"
            >
              <Save className="size-4" /> Save
            </Button>
            {hasUserKey && (
              <Button
                disabled={keyActionLoading}
                onClick={() => setEditMode(false)}
                size="sm"
                type="button"
                variant="destructive"
              >
                Cancel
              </Button>
            )}
          </form>
        )}
        {keyError && (
          <div className="mt-1 text-red-500 text-xs">{keyError}</div>
        )}
      </Card>
    );
  }

  return (
    <div className="relative mx-auto flex h-[90vh] w-full flex-col gap-8 md:flex-row">
      {/* Columna izquierda: contenido central */}
      <div className="relative flex flex-1 flex-col items-center">
        {/* OpenAI API Key Modal - Se abre automáticamente si no hay clave */}
        <Dialog onOpenChange={setApiKeyDialogOpen} open={apiKeyDialogOpen}>
          <DialogContent className="w-full max-w-lg">
            <OpenAIApiKeyCard />
          </DialogContent>
        </Dialog>
        {/* Área central con Card y tweet generado o placeholder */}
        <Card
          className={cn(
            "flex w-full max-w-lg flex-col items-center gap-6 border-none p-8 shadow-custom",
            !hasUserKey && "pointer-events-none opacity-50"
          )}
        >
          {editedResponse ? (
            <div className="flex w-full items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage alt={displayName} src={avatarUrl} />
                <AvatarFallback>{displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{displayName}</span>
                  <span className="text-muted-foreground text-sm">
                    @{username}
                  </span>
                </div>
                <div className="mt-2 whitespace-pre-line text-lg">
                  {isEditingResponse ? (
                    <>
                      <Textarea
                        autoFocus
                        className="min-h-[80px] w-full border bg-primary p-2 text-lg shadow-custom focus:border-blue-400 focus:outline-none focus:ring"
                        onChange={(e) => setDraftEditedResponse(e.target.value)}
                        value={draftEditedResponse}
                      />
                      <div className="mt-2 flex gap-2">
                        <Button
                          onClick={() => {
                            setEditedResponse(draftEditedResponse);
                            setIsEditingResponse(false);
                          }}
                          size="sm"
                          type="button"
                          variant="custom"
                        >
                          <Save className="size-4" /> Save
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditingResponse(false);
                            setDraftEditedResponse(editedResponse);
                          }}
                          size="sm"
                          type="button"
                          variant="destructive"
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-start justify-start gap-2">
                      <div className="rounded-lg bg-primary p-2 shadow-custom">
                        {editedResponse}
                      </div>
                      <Button
                        onClick={() => {
                          setIsEditingResponse(true);
                          setDraftEditedResponse(editedResponse);
                        }}
                        size="sm"
                        type="button"
                        variant="custom"
                      >
                        <Pencil className="size-4" /> Edit Post
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full py-12 text-center text-foreground/70 text-lg">
              Your generated post will appear here. Write a prompt below and
              click Generate!
            </div>
          )}
          {editedResponse && (
            // biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop drop zone
            <div
              className={cn(
                "mt-4 flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors",
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-gray-300 bg-transparent"
              )}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                setImageUrlFromLibrary(null);
                setImageFileError(null);
                if (file?.type.startsWith("image/")) {
                  if (file.size > 1024 * 1024) {
                    setImageFileError("Image must be less than 1MB.");
                    setImageFile(null);
                  } else {
                    setImageFile(file);
                    setImageFileError(null);
                  }
                }
              }}
              role="presentation"
            >
              <label className="w-full cursor-pointer text-center font-medium text-foreground text-sm">
                Add an image (optional)
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    setImageUrlFromLibrary(null);
                    setImageFileError(null);
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 1024 * 1024) {
                        setImageFileError("Image must be less than 1MB.");
                        setImageFile(null);
                      } else {
                        setImageFile(file);
                        setImageFileError(null);
                      }
                    }
                  }}
                  type="file"
                />
              </label>
              <span className="text-foreground text-xs">
                Drag & drop or click to select an image
              </span>
              <span className="ml-2 text-gray-500 text-xs">
                Max file size: 1MB. Larger files will be rejected.
              </span>
              <div className="mt-2 flex gap-2">
                <Button
                  onClick={() => setMediaDialogOpen(true)}
                  type="button"
                  variant="outline"
                >
                  Choose from Media Library
                </Button>
                <MediaLibraryPicker
                  onOpenChange={setMediaDialogOpen}
                  onSelect={(url: string) => {
                    setImageUrlFromLibrary(url);
                    setImageFile(null);
                    setImageFileError(null);
                    setMediaDialogOpen(false);
                  }}
                  open={mediaDialogOpen}
                  userId={userId}
                />
              </div>
              {(imageUrlFromLibrary || imageFile) && (
                <div className="mt-2 flex flex-col items-center gap-2">
                  <Image
                    alt="Preview"
                    className="max-h-40 rounded-lg border"
                    height={160}
                    src={
                      imageUrlFromLibrary ||
                      (imageFile ? URL.createObjectURL(imageFile) : "")
                    }
                    width={160}
                  />
                  <button
                    className="text-red-500 text-xs underline"
                    onClick={() => {
                      setImageFile(null);
                      setImageUrlFromLibrary(null);
                      setImageFileError(null);
                    }}
                    type="button"
                  >
                    Remove image
                  </button>
                </div>
              )}
              {imageFileError && (
                <div className="mt-2 text-red-500 text-xs">
                  {imageFileError}
                </div>
              )}
            </div>
          )}
        </Card>
        {/* Barra de acciones inferior fixed respecto al contenido */}
        <div className="relative bottom-2 left-1/2 my-4 w-full max-w-xl -translate-x-1/2 md:absolute">
          <form
            className="flex flex-col items-end gap-2 rounded-xl border border-none bg-background p-4 shadow-custom"
            onSubmit={handleGenerate}
          >
            <Textarea
              className={cn(
                "min-h-[48px] w-full flex-1 resize-none rounded border p-2 text-lg focus:border-blue-400 focus:outline-none focus:ring",
                !hasUserKey && "opacity-50"
              )}
              disabled={!hasUserKey}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Write about your post..."
              required
              value={prompt}
            />
            <div className="flex w-full flex-col gap-2 md:flex-row md:items-center">
              {/* Botón para abrir el modal de API Key - siempre visible y funcional */}
              <Button
                className="text-xs"
                onClick={() => setApiKeyDialogOpen(true)}
                type="button"
                variant="outline"
              >
                <Info className="mr-1 size-4" />
                {hasUserKey ? "Manage API Key" : "Add API Key"}
              </Button>
              <Select
                disabled={availableModels.length === 1 || !hasUserKey}
                onValueChange={setModel}
                value={model}
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
                  <Button
                    className="text-xs"
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <Settings className="size-4" />
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
                        {/* biome-ignore lint/a11y/noLabelWithoutControl: Slider is a composite Radix component */}
                        <label className="mb-1 block font-medium">
                          Presence Penalty{" "}
                          <span className="ml-1 text-gray-400 text-xs">
                            ({presencePenalty})
                          </span>
                        </label>
                        <Slider
                          max={2}
                          min={-2}
                          onValueChange={([v]) => setPresencePenalty(v)}
                          step={0.1}
                          value={[presencePenalty]}
                        />
                      </div>
                      <div className="flex-1">
                        {/* biome-ignore lint/a11y/noLabelWithoutControl: Slider is a composite Radix component */}
                        <label className="mb-1 block font-medium">
                          Frequency Penalty{" "}
                          <span className="ml-1 text-gray-400 text-xs">
                            ({frequencyPenalty})
                          </span>
                        </label>
                        <Slider
                          max={2}
                          min={-2}
                          onValueChange={([v]) => setFrequencyPenalty(v)}
                          step={0.1}
                          value={[frequencyPenalty]}
                        />
                      </div>
                    </div>
                    <div>
                      {/* biome-ignore lint/a11y/noLabelWithoutControl: Slider is a composite Radix component */}
                      <label className="mb-1 block font-medium">
                        Top-p{" "}
                        <span className="ml-1 text-gray-400 text-xs">
                          ({topP})
                        </span>
                      </label>
                      <Slider
                        max={1}
                        min={0}
                        onValueChange={([v]) => setTopP(v)}
                        step={0.01}
                        value={[topP]}
                      />
                    </div>
                  </div>
                  <DialogClose asChild>
                    <Button className="mt-4 w-full" variant="outline">
                      Close
                    </Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
              {/* On mobile: show Generate if no post, Save if post exists */}
              {editedResponse ? (
                <Button
                  className="flex w-full items-center justify-center md:hidden"
                  disabled={isPending}
                  onClick={handleSaveNoArgs}
                  type="button"
                  variant="custom"
                >
                  <Save className="size-4" />{" "}
                  {isPending ? "Saving..." : "Save Post"}
                </Button>
              ) : (
                <Button
                  className="flex w-full items-center justify-center md:order-last md:flex md:w-auto"
                  disabled={!isFormValid || loading || !hasUserKey}
                  type="submit"
                  variant="custom"
                >
                  {loading ? (
                    <Loading className="size-4" />
                  ) : (
                    <Atom className="size-4" />
                  )}
                  {loading ? "Generating..." : "Generate"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
      {/* Columna derecha: panel de métricas (desktop) */}
      <div
        className={cn(
          "relative top-0 right-0 h-full w-full md:w-96",
          !hasUserKey && "pointer-events-none opacity-50"
        )}
      >
        <Card className="flex h-full w-full flex-col overflow-y-auto border-none p-4 shadow-custom">
          {editedResponse ? (
            <MetricsPanel
              isPending={isPending}
              metrics={metrics}
              onCopy={handleCopyNoArgs}
              onSave={handleSaveNoArgs}
              response={editedResponse}
              saveStatus={saveStatus}
              showSaveButton={true}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-4 text-center text-muted-foreground">
              <h3 className="mb-2 font-semibold text-xl">Metrics Panel</h3>
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
              <span className="text-gray-400 text-xs">
                Generate a post to see your metrics here.
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score > 80) {
    return "text-green-500";
  }
  if (score > 50) {
    return "text-yellow-500";
  }
  return "text-red-500";
}

function getScoreHex(score: number): string {
  if (score > 80) {
    return "#22c55e";
  }
  if (score > 50) {
    return "#eab308";
  }
  return "#ef4444";
}

function MetricsPanel({
  metrics,
  onCopy,
  onSave,
  isPending,
  response,
  saveStatus,
  showSaveButton = false,
}: {
  metrics: ReturnType<typeof getTweetMetrics>;
  onCopy: () => void;
  onSave: () => void;
  isPending: boolean;
  response: string;
  saveStatus: string | null;
  showSaveButton?: boolean;
}) {
  const scoreColor = getScoreColor(metrics.score);
  const strokeColor = getScoreHex(metrics.score);
  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Gauge Score */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative flex items-center justify-center">
          {/* SVG Gauge */}
          <svg height="60" viewBox="0 0 120 60" width="120">
            <title>Post score gauge</title>
            <path
              d="M10,60 A50,50 0 0,1 110,60"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            <path
              d="M10,60 A50,50 0 0,1 110,60"
              fill="none"
              stroke={strokeColor}
              strokeDasharray={157}
              strokeDashoffset={157 - (metrics.score / 100) * 157}
              strokeLinecap="round"
              strokeWidth="12"
            />
            <text
              className={scoreColor}
              fill="currentColor"
              fontSize="32"
              fontWeight="bold"
              textAnchor="middle"
              x="60"
              y="58"
            >
              {metrics.score}
            </text>
          </svg>
        </div>
        <div className="text-muted-foreground text-xs">Post Score</div>
      </div>
      {/* Métricas detalladas */}
      <div className="flex flex-col gap-3 rounded-xl bg-primary p-4 shadow-custom">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-foreground/70" />{" "}
          <span className="flex-1">Characters</span>{" "}
          <span className="font-semibold">{metrics.charCount} / 280</span>
        </div>
        <div className="flex items-center gap-2">
          <Hash className="size-4 text-foreground/70" />{" "}
          <span className="flex-1">Hashtags</span>{" "}
          <span className="font-semibold">{metrics.hashtags}</span>
        </div>
        <div className="flex items-center gap-2">
          <AtSign className="size-4 text-foreground/70" />{" "}
          <span className="flex-1">Mentions</span>{" "}
          <span className="font-semibold">{metrics.mentions}</span>
        </div>
        <div className="flex items-center gap-2">
          <LinkIcon className="size-4 text-foreground/70" />{" "}
          <span className="flex-1">Links</span>{" "}
          <span className="font-semibold">{metrics.links}</span>
        </div>
        <div className="flex items-center gap-2">
          <Info className="size-4 text-foreground/70" />{" "}
          <span className="flex-1">Question</span>{" "}
          <span className="font-semibold">
            {metrics.isQuestion ? (
              <CheckCircle className="inline size-4 text-airlume" />
            ) : (
              "No"
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <List className="size-4 text-foreground/70" />{" "}
          <span className="flex-1">CTA</span>{" "}
          <span className="font-semibold">
            {metrics.cta ? (
              <CheckCircle className="inline size-4 text-airlume" />
            ) : (
              "No"
            )}
          </span>
        </div>
      </div>
      {/* Acciones */}
      <div className="mt-2 flex gap-2">
        <Button
          disabled={!response}
          onClick={() => onCopy()}
          size="sm"
          type="button"
          variant="outline"
        >
          <Copy className="size-4" /> Copy Post
        </Button>
        {showSaveButton && (
          <Button
            className="hidden md:flex"
            disabled={isPending}
            onClick={onSave}
            size="sm"
            type="button"
            variant="custom"
          >
            <Save className="size-4" /> {isPending ? "Saving..." : "Save Post"}
          </Button>
        )}
      </div>
      {saveStatus && (
        <div className="mt-1 text-airlume text-xs">{saveStatus}</div>
      )}
    </div>
  );
}
