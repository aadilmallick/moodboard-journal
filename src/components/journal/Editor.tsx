"use client";
import { fetcher } from "@/utils/fetcher";
import { Analysis, JournalEntry } from "@prisma/client";
import React, { useCallback } from "react";
import AnalysisComponent from "./AnalysisComponent";

export interface EditorProps {
  journalEntry: JournalEntry & {
    analysis?: Analysis;
  };
}

const Editor = ({ journalEntry }: EditorProps) => {
  const [value, setValue] = React.useState<string>(journalEntry.content);
  const [saving, setSaving] = React.useState<boolean>(false);
  const isTyping = React.useRef<boolean>(false);
  const [analysis, setAnalysis] = React.useState<Analysis | null>(
    journalEntry.analysis || null
  );

  async function saveEntry() {
    const res = await fetcher({
      url: `/api/journal/${journalEntry.id}`,
      method: "PATCH",
      body: {
        content: value,
      },
    });
    return res.entry;
  }

  React.useEffect(() => {
    async function bruh() {
      setSaving(true);
      const entry = await saveEntry();
      setAnalysis(entry.analysis);
      setSaving(false);
      isTyping.current = false;
    }
    const interval = setInterval(() => {
      if (isTyping.current) {
        bruh();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [value, journalEntry.id]);

  return (
    <div className="h-full grid grid-cols-3">
      <div className="relative col-span-2">
        {saving && (
          <div className="absolute top-0 left-0 p-2 bg-white/50 slide-up">
            Saving...
          </div>
        )}
        <textarea
          name=""
          id=""
          className="h-full w-full p-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-y"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            isTyping.current = true;
          }}
        ></textarea>
      </div>
      <div className="col-span-1">
        {analysis && <AnalysisComponent analysis={analysis} />}
      </div>
    </div>
  );
};

export default Editor;

function throttle(fn: Function, wait: number = 300) {
  let inThrottle: boolean,
    lastFn: ReturnType<typeof setTimeout>,
    lastTime: number;
  return function (this: any) {
    const context = this,
      args = arguments;
    if (!inThrottle) {
      fn.apply(context, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
}

function debounce(fn: Function, ms = 300) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}
