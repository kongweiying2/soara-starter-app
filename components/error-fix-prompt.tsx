"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ErrorFixPrompt({ prompt }: { prompt: string }) {
  const [message, setMessage] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setMessage('Prompt copied.');
    } catch {
      setMessage('Select the prompt text and copy it manually.');
    }
  }
  return <div className="space-y-3 border-t border-red-200 pt-4 dark:border-red-900">
    <p className="text-sm font-medium">Paste this into your AI agent</p>
    <pre className="whitespace-pre-wrap break-words rounded-lg bg-background/70 p-3 font-sans text-sm leading-6">{prompt}</pre>
    <Button type="button" variant="outline" onClick={copy}>Copy prompt</Button>
    {message && <p role="status" className="text-xs">{message}</p>}
  </div>;
}
