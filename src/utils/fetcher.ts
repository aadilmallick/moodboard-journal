import { WithAnalysis } from "@/app/api/journal/[id]/route";
import { JournalEntry } from "@prisma/client";

export enum API {
  JOURNAL = "/api/journal",
  SINGLE_JOURNAL = "/api/journal/[id]",
  QUESTION = "/api/question",
}

export interface RequestBodyTypes {
  [API.JOURNAL]: null;
  [API.SINGLE_JOURNAL]: {
    content: string;
  };
  [API.QUESTION]: {
    question: string;
  };
}

export interface ResponseTypes {
  [API.JOURNAL]: {
    entry: JournalEntry;
  };
  [API.SINGLE_JOURNAL]: {
    entry: WithAnalysis;
  };
  [API.QUESTION]: {
    answer: string;
  };
}

interface FetcherProps {
  url: API.JOURNAL | string | `/api/journal/${string}`;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  json?: boolean;
}

export async function fetcher({
  url,
  method = "POST",
  body,
  json,
}: {
  url: API.JOURNAL;
  method: "POST";
  body?: RequestBodyTypes[API.JOURNAL];
  json?: boolean;
}): Promise<ResponseTypes[API.JOURNAL]>;

export async function fetcher({
  url,
  method = "POST",
  body,
  json,
}: {
  url: API.QUESTION;
  method: "POST";
  body: RequestBodyTypes[API.QUESTION];
  json?: boolean;
}): Promise<ResponseTypes[API.QUESTION]>;

export async function fetcher({
  url,
  method = "PATCH",
  body,
  json,
}: {
  url: `/api/journal/${string}`;
  method: "PATCH";
  body: RequestBodyTypes[API.SINGLE_JOURNAL];
  json?: boolean;
}): Promise<ResponseTypes[API.SINGLE_JOURNAL]>;

export async function fetcher({
  url,
  method,
  body,
  json = true,
}: FetcherProps) {
  const res = await fetch(url, {
    method,
    body: body && JSON.stringify(body),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("API Error");
  }

  if (json) {
    const data = await res.json();
    return data;
  }
}
