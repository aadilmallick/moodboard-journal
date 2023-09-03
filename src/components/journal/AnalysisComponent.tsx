"use client";
import { Analysis } from "@prisma/client";
import React from "react";

const AnalysisComponent = ({ analysis }: { analysis: Analysis }) => {
  return (
    <div>
      <h2>Analysis</h2>
      <div className="flex flex-col gap-2">
        <p className="border-b">Mood: {analysis.mood}</p>
        <p className="border-b flex items-center">
          Color:{" "}
          <span
            className="inline-block h-4 w-4 rounded-full ml-4"
            style={{
              backgroundColor: analysis.color,
            }}
          ></span>
        </p>
        <p className="border-b">
          Tone: {analysis.negative === true ? ":(" : ":)"}
        </p>
        <p className="border-b">Summary: {analysis.summary}</p>
      </div>
    </div>
  );
};

export default AnalysisComponent;
