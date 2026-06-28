"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const EmailSubscription = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [language, setLanguage] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribeClick = async () => {
    if (!isExpanded) {
      setIsExpanded(true);
      setStatusMessage(null);
      setStatusType(null);
      return;
    }

    if (!email.trim()) {
      setStatusMessage("Please enter a valid email address.");
      setStatusType("error");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    setStatusType(null);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          dob: birthdate.trim(),
          language: language.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Subscription failed.");
      }

      setStatusMessage("Thank You!");
      setStatusType("success");
      setEmail("");
      setName("");
      setBirthdate("");
      setLanguage("");
      setIsExpanded(false);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Subscription failed.",
      );
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 px-2 sm:px-0">
        <h3 className="mb-4 text-center text-xl font-semibold tracking-tight text-balance md:text-2xl lg:text-3xl">
          Help us personalize your newsletter
        </h3>
      </div>

      <div className="mb-4 flex flex-row items-center gap-3">
        <Input
          placeholder="Enter Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 min-w-0 flex-1 text-base"
        />
        <Button
          onClick={handleSubscribeClick}
          size="lg"
          className="h-12 min-h-[3rem] px-6 text-base"
          disabled={isSubmitting}
        >
          {isExpanded
            ? isSubmitting
              ? "Submitting..."
              : "Submit"
            : "Subscribe"}
        </Button>
      </div>

      {statusMessage && (
        <div
          className={`mb-4 text-sm font-semibold tracking-tight text-zinc-100 ${
            statusType === "success" ? "" : "text-rose-200"
          }`}
          role="status"
        >
          {statusMessage}
        </div>
      )}

      {isExpanded && (
        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="flex flex-col items-start gap-2 text-left text-sm font-semibold text-zinc-100">
            <span>What's your name?</span>
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="flex flex-col items-start gap-2 text-left text-sm font-semibold text-zinc-100">
            <span>What's your birthdate?</span>
            <Input
              placeholder="Your birthdate"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </label>

          <label className="flex flex-col items-start gap-2 text-left text-sm font-semibold text-zinc-100 md:col-span-2">
            <span>What's your preferred language?</span>
            <Input
              placeholder="e.g., English"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default EmailSubscription;
