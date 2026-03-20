"use client";

import { useUser } from "@clerk/nextjs";
import { Eye, EyeOff, Info } from "lucide-react";
import { useEffect, useState } from "react";

import { TwitterOAuthConnectionCard } from "@/components/twitter-oauth-connection-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserProfileDialog } from "@/components/user-profile-dialog";

export default function SettingsPageClient() {
  const { user, isLoaded } = useUser();
  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [blueskyHandle, setBlueskyHandle] = useState("");
  const [blueskyPassword, setBlueskyPassword] = useState("");
  const [blueskyStatus, setBlueskyStatus] = useState("");
  const [hasBluesky, setHasBluesky] = useState(false);
  const [showBlueskyPassword, setShowBlueskyPassword] = useState(false);
  const [loadingBluesky, setLoadingBluesky] = useState(false);
  const [last4, setLast4] = useState<string | null>(null);

  useEffect(() => {
    async function fetchKeyStatus() {
      setLoading(true);
      try {
        const res = await fetch("/api/user-openai-key");
        const data = await res.json();
        setHasKey(Boolean(data.hasKey));
        setLast4(data.last4 || null);
      } catch {
        setHasKey(false);
        setLast4(null);
      } finally {
        setLoading(false);
      }
    }
    fetchKeyStatus();
  }, []);

  useEffect(() => {
    async function fetchBluesky() {
      setLoadingBluesky(true);
      try {
        const res = await fetch("/api/bluesky");
        const data = await res.json();
        if (data?.handle) {
          setHasBluesky(true);
          setBlueskyHandle(data.handle);
        } else {
          setHasBluesky(false);
          setBlueskyHandle("");
        }
      } catch {
        setHasBluesky(false);
        setBlueskyHandle("");
      } finally {
        setLoadingBluesky(false);
      }
    }
    fetchBluesky();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/user-openai-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openai_key: apiKey }),
      });
      if (!res.ok) {
        throw new Error("Failed to save key");
      }
      setStatus("Saved!");
      setHasKey(true);
      setApiKey("");
    } catch {
      setStatus("Failed to save key");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/user-openai-key", { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete key");
      }
      setStatus("Deleted!");
      setHasKey(false);
      setApiKey("");
    } catch {
      setStatus("Failed to delete key");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBluesky = async () => {
    setLoadingBluesky(true);
    setBlueskyStatus("");
    try {
      const res = await fetch("/api/bluesky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: blueskyHandle,
          appPassword: blueskyPassword,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to save credentials");
      }
      setBlueskyStatus("Saved!");
      setHasBluesky(true);
      setBlueskyPassword("");
    } catch {
      setBlueskyStatus("Failed to save credentials");
    } finally {
      setLoadingBluesky(false);
    }
  };

  const handleDeleteBluesky = async () => {
    setLoadingBluesky(true);
    setBlueskyStatus("");
    try {
      const res = await fetch("/api/bluesky", { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete credentials");
      }
      setBlueskyStatus("Deleted!");
      setHasBluesky(false);
      setBlueskyHandle("");
      setBlueskyPassword("");
    } catch {
      setBlueskyStatus("Failed to delete credentials");
    } finally {
      setLoadingBluesky(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return <div>Please sign in.</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="mb-4 font-bold text-2xl">Settings</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Account Info Section */}
        <Card className="space-y-4 border-none p-6 shadow-custom">
          <div className="font-semibold text-lg">
            Account Info & Social Connections
          </div>
          <div className="text-foreground/70 text-sm">
            To change your account info (profile, email, password, or social
            connections), use the Account dialog below. This is managed securely
            by Clerk.
          </div>
          <Button onClick={() => setAccountDialogOpen(true)} variant="outline">
            Open Account Dialog
          </Button>
          <UserProfileDialog
            onOpenChange={setAccountDialogOpen}
            open={accountDialogOpen}
          />
        </Card>
        {/* OpenAI API Key Section */}
        <Card className="space-y-4 border-none p-6 shadow-custom">
          <div className="font-semibold text-lg">OpenAI API Key</div>
          {hasKey ? (
            <div className="flex flex-col gap-4 space-y-2">
              <div className="text-airlume">
                Your own OpenAI API key is set. You can use all models in the
                generator.
                {last4 && (
                  <span className="ml-2 text-foreground/70">
                    (ends in <b>{last4}</b>)
                  </span>
                )}
              </div>
              <Button
                disabled={loading}
                onClick={handleDelete}
                variant="destructive"
              >
                Remove API Key
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 space-y-2">
              <Input
                disabled={loading}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                type="password"
                value={apiKey}
              />
              <Button
                disabled={loading || !apiKey}
                onClick={handleSave}
                variant="custom"
              >
                Save API Key
              </Button>
              <div className="text-foreground/70 text-sm">
                Add your own OpenAI API key to unlock all models. Without it,
                only GPT-4o-nano is available.
              </div>
            </div>
          )}
          {status && <div className="text-airlume text-sm">{status}</div>}
        </Card>
        {/* Bluesky Credentials Section */}
        <Card className="space-y-4 border-none p-6 shadow-custom">
          <div className="flex items-center gap-2 font-semibold text-lg">
            Bluesky Credentials
          </div>
          {hasBluesky ? (
            <div className="flex flex-col gap-4 space-y-2">
              <div className="text-airlume">
                Connected to Bluesky as <b>@{blueskyHandle}</b>
              </div>
              <div className="text-foreground/70 text-sm">
                Your credentials are securely stored. You can update or remove
                them below.
              </div>
              <Button
                disabled={loadingBluesky}
                onClick={handleDeleteBluesky}
                variant="destructive"
              >
                Remove Bluesky Credentials
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label
                  className="mb-1 flex items-center gap-1 font-medium"
                  htmlFor="bluesky-handle"
                >
                  Handle
                  <span
                    className="inline-block"
                    title="Your Bluesky username (handle)"
                  >
                    <Info className="size-4" />
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                    @
                  </span>
                  <Input
                    autoComplete="username"
                    className="pl-8"
                    disabled={loadingBluesky}
                    id="bluesky-handle"
                    onChange={(e) => setBlueskyHandle(e.target.value)}
                    placeholder="handle"
                    type="text"
                    value={blueskyHandle}
                  />
                </div>
                <div className="mt-1 text-foreground/70 text-xs">
                  For example: yourname.bsky.social
                </div>
              </div>
              <div>
                <label
                  className="mb-1 block font-medium"
                  htmlFor="bluesky-app-password"
                >
                  Bluesky App Password
                </label>
                <div className="mb-2 text-foreground/70 text-xs">
                  Use an app password to connect safely. This is <b>not</b> your
                  account password.{" "}
                  <a
                    className="text-airlume underline"
                    href="https://bsky.app/settings/app-passwords"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Generate app password in Bluesky
                  </a>
                </div>
                <div className="relative">
                  <Input
                    autoComplete="current-password"
                    className="pr-10"
                    disabled={loadingBluesky}
                    id="bluesky-app-password"
                    onChange={(e) => setBlueskyPassword(e.target.value)}
                    placeholder="xxxx-xxxx-xxxx-xxxx"
                    type={showBlueskyPassword ? "text" : "password"}
                    value={blueskyPassword}
                  />
                  <button
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowBlueskyPassword((v) => !v)}
                    tabIndex={-1}
                    type="button"
                  >
                    {showBlueskyPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                disabled={loadingBluesky || !blueskyHandle || !blueskyPassword}
                onClick={handleSaveBluesky}
              >
                {loadingBluesky ? "Saving..." : "Save Credentials"}
              </Button>
            </div>
          )}
          {blueskyStatus && (
            <div className="text-airlume text-sm">{blueskyStatus}</div>
          )}
        </Card>
        <Card className="space-y-4 border-none p-6 shadow-custom">
          <TwitterOAuthConnectionCard />
        </Card>
      </div>
    </div>
  );
}
