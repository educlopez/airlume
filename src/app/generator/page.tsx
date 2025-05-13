"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";

const MODELS = [
  { label: "GPT-4o (latest, fast)", value: "gpt-4o" },
  { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
  { label: "GPT-3.5 Turbo (cheap)", value: "gpt-3.5-turbo" },
];

export default function GeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(MODELS[0].value);
  const [temperature, setTemperature] = useState(1);
  const [maxTokens, setMaxTokens] = useState(512);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  // Advanced options
  const [systemPrompt, setSystemPrompt] = useState("");
  const [presencePenalty, setPresencePenalty] = useState(0);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0);
  const [topP, setTopP] = useState(1);
  const { user } = useUser();
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const isFormValid = prompt.trim() && apiKey.trim();

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem("generatorPrefs") || "{}") || {};
      if (prefs.model) setModel(prefs.model);
      if (prefs.temperature !== undefined) setTemperature(prefs.temperature);
      if (prefs.maxTokens !== undefined) setMaxTokens(prefs.maxTokens);
      if (prefs.systemPrompt !== undefined) setSystemPrompt(prefs.systemPrompt);
      if (prefs.presencePenalty !== undefined) setPresencePenalty(prefs.presencePenalty);
      if (prefs.frequencyPenalty !== undefined) setFrequencyPenalty(prefs.frequencyPenalty);
      if (prefs.topP !== undefined) setTopP(prefs.topP);
      if (prefs.showAdvanced !== undefined) setShowAdvanced(prefs.showAdvanced);
    } catch {}
  }, []);

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
    };
    localStorage.setItem("generatorPrefs", JSON.stringify(prefs));
  }, [model, temperature, maxTokens, systemPrompt, presencePenalty, frequencyPenalty, topP, showAdvanced]);

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
    setError("");
    setLoading(true);
    setCopied(false);
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
      });
      if (!res.body) throw new Error("No response body");
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
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleSave() {
    setSaveStatus(null);
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
      ]);
      if (error) throw error;
      setSaveStatus("Saved!");
    } catch (err: unknown) {
      if (isErrorWithMessage(err)) {
        setSaveStatus(err.message);
      } else {
        setSaveStatus("Failed to save");
      }
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Content Generator</h1>
      <form onSubmit={handleGenerate} className="space-y-6 bg-white rounded shadow p-6">
        <div>
          <label className="block font-medium mb-1">Prompt <span className="text-red-500">*</span></label>
          <textarea
            className="w-full border rounded p-2 min-h-[80px] focus:outline-none focus:ring focus:border-blue-400"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
            placeholder="Describe what you want to generate..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">OpenAI API Key <span className="text-red-500">*</span></label>
          <div className="flex items-center gap-2">
            <input
              type={showKey ? "text" : "password"}
              className="w-full border rounded p-2 focus:outline-none focus:ring focus:border-blue-400"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              placeholder="sk-..."
              autoComplete="off"
            />
            <Button type="button" variant="outline" onClick={() => setShowKey((v) => !v)} tabIndex={-1}>
              {showKey ? "Hide" : "Show"}
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
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
        <div>
          <label className="block font-medium mb-1">Model</label>
          <select
            className="w-full border rounded p-2 focus:outline-none focus:ring focus:border-blue-400"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium mb-1">Temperature
              <span className="ml-1 text-xs text-gray-400">({temperature})</span>
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
            <label className="block font-medium mb-1">Max Tokens
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
          <div className="space-y-4 border rounded p-4 bg-gray-50 mt-2">
            <div>
              <label className="block font-medium mb-1">System Prompt</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="e.g. You are a helpful assistant."
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-medium mb-1">Presence Penalty
                  <span className="ml-1 text-xs text-gray-400">({presencePenalty})</span>
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
                <label className="block font-medium mb-1">Frequency Penalty
                  <span className="ml-1 text-xs text-gray-400">({frequencyPenalty})</span>
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
              <label className="block font-medium mb-1">Top-p
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
        <Button type="submit" disabled={!isFormValid || loading} className="w-full flex items-center justify-center">
          {loading && <span className="animate-spin mr-2">⏳</span>}
          {loading ? "Generating..." : "Generate"}
        </Button>
        {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
      </form>
      <div className="mt-8">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">Response</span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleCopy} disabled={!response}>
              {copied ? "Copied!" : "Copy"}
            </Button>
            {user && response && (
              <Button type="button" variant="outline" size="sm" onClick={handleSave}>
                Save
              </Button>
            )}
          </div>
        </div>
        <div className="whitespace-pre-wrap bg-gray-100 rounded p-4 min-h-[100px] border">
          {response || <span className="text-gray-400">The generated content will appear here.</span>}
        </div>
        {saveStatus && <div className="mt-2 text-sm text-green-600">{saveStatus}</div>}
      </div>
    </div>
  );
}