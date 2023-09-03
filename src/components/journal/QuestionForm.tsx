"use client";
import { API, fetcher } from "@/utils/fetcher";
import React, { useState } from "react";

const QuestionForm = () => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { answer } = await fetcher({
      url: API.QUESTION,
      method: "POST",
      body: { question },
    });

    setLoading(false);
    setQuestion("");
    setAnswer(answer);
  };
  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="border border-gray-300 rounded-md p-2 text-lg"
          disabled={loading}
          placeholder="Ask a question..."
        />
        <button
          disabled={loading}
          type="submit"
          className="bg-blue-400 px-8 py-2 rounded-md"
        >
          Ask
        </button>
      </form>
      {loading && <p>Loading...</p>}
      {answer && <p className="my-4 text-xl">{answer}</p>}
    </div>
  );
};

export default QuestionForm;
