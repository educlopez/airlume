"use client";

import { SignUpButton, useUser } from "@clerk/nextjs";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Educalvolpz from "@/assets/images/avatar/educalvolpz.jpg";
import Midudev from "@/assets/images/avatar/midudev.jpg";
import Shadcn from "@/assets/images/avatar/shadcn.jpg";

import { Button } from "@/components/ui/button";

import AnimatedPostCard from "./animated-post-card";

const TRAILING_SLASH_REGEX = /\/$/;

// Fake post data
const fakePosts = [
  {
    id: 1,
    text: "Just tried out a new AI tool—blown away by the results! 🤯 Highly recommend.",
    avatar: Midudev.src,
  },
  {
    id: 2,
    text: "See that tools I tested? I love it. Productivity boost unlocked! 🚀",
    avatar: Shadcn.src,
  },
  {
    id: 3,
    text: "Tomorrow is a good day to start something new. Let's go! 💡",
    avatar: Educalvolpz.src,
  },
  {
    id: 4,
    text: "Writing threads has never been easier. AI is changing the game! ✍️🤖",
    avatar: Shadcn.src,
  },
  {
    id: 5,
    text: "Batch-creating content on Sundays = stress-free week ahead. Try it!",
    avatar: Educalvolpz.src,
  },
  {
    id: 6,
    text: "Poll: Do you prefer morning or evening writing sessions? ☀️🌙",
    avatar: Midudev.src,
  },
];

const CARD_WIDTH = 260;
const VISIBLE_COUNT = 3;
const ANIMATION_DURATION = 12; // Slower: 12 seconds for a card to cross

export default function HeroSection() {
  const [heroWidth, setHeroWidth] = useState(1200);
  const heroRef = useRef<HTMLDivElement>(null);
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    function updateWidth() {
      if (heroRef.current) {
        setHeroWidth(heroRef.current.offsetWidth + CARD_WIDTH);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Use a single timer for smooth animation
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed((Date.now() - start) / 1000);
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, []);

  function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  // For each post, calculate its progress and position
  return (
    <section
      className="relative w-full overflow-hidden bg-background px-4 py-36 md:px-0"
      ref={heroRef}
    >
      {/* Animated horizontal post cards */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {fakePosts.map((post, i) => {
          // Stagger each post by ANIMATION_DURATION / fakePosts.length
          const total = fakePosts.length;
          const period = ANIMATION_DURATION;
          const offset = (i * period) / total;
          // Progress for this post (0 to 1)
          let progress = ((elapsed - offset) / period) % 1;
          if (progress < 0) {
            progress += 1;
          }
          // X position from left to right
          const x = lerp(-CARD_WIDTH, heroWidth, progress);
          // Fade in at left, fade out at right
          let opacity = 1;
          if (progress < 0.15) {
            opacity = progress / 0.15;
          } else if (progress > 0.85) {
            opacity = (1 - progress) / 0.15;
          }
          return (
            <motion.div
              animate={{ x, opacity }}
              initial={false}
              key={post.id}
              style={{
                position: "absolute",
                top: `calc(30% + ${((i % VISIBLE_COUNT) * CARD_WIDTH) / 2}px)`,
                left: 0,
                width: CARD_WIDTH,
                pointerEvents: "auto",
              }}
              transition={{
                x: { type: "tween", duration: 0 },
                opacity: { duration: 0 },
              }}
            >
              <AnimatedPostCard avatar={post.avatar} title={post.text} />
            </motion.div>
          );
        })}
      </div>
      {/* Radial gradient overlay (fades the post) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 left-1/2 z-20 w-full -translate-x-1/2"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, var(--color-background) 50%, transparent 100%)",
        }}
      />
      {/* Hero content (always on top) */}
      <div className="relative z-30 mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <h1 className="font-extrabold text-6xl text-foreground leading-tight tracking-tight">
          Create irresistible content for your social media with AI
        </h1>
        <p className="mb-10 text-2xl text-foreground/70 leading-relaxed">
          Airlume helps you create threads and viral posts in seconds. Save
          time, spark your creativity, and grow your audience.
        </p>
        <div className="flex gap-6">
          {isLoaded && isSignedIn && user ? (
            <Button asChild size="lg" variant="custom">
              <a
                href={
                  `/${user.username || ""}`.replace(TRAILING_SLASH_REGEX, "") ||
                  "/"
                }
              >
                Go to dashboard
              </a>
            </Button>
          ) : (
            <SignUpButton>
              <Button size="lg" variant="custom">
                Get started free
              </Button>
            </SignUpButton>
          )}
          <Button asChild size="lg" variant="outline">
            <a href="#features">See features</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
