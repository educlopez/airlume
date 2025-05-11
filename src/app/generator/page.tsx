"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function GeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setResponse("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, apiKey }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullText = "";
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          fullText += chunk;
          setResponse((prev) => prev + chunk);
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Content Generator</h1>
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Prompt</label>
          <textarea
            className="w-full border rounded p-2 min-h-[80px]"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">OpenAI API Key</label>
          <input
            type="password"
            className="w-full border rounded p-2"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
            placeholder="sk-..."
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Generating..." : "Generate"}
        </Button>
      </form>
      {error && <div className="text-red-500 mt-4">{error}</div>}
      <div className="mt-6 whitespace-pre-wrap bg-gray-100 rounded p-4 min-h-[100px]">
        {response}
      </div>
    </div>
  );
}