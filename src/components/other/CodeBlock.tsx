"use client";
import React from "react";
import { usePrism } from "next-prism";

// Import a theme.css
import "next-prism/themes/tomorrow.css";

interface CodeBlockProps {
  children?: React.ReactNode;
  language?: string;
}

const CodeBlock = ({ children, language }: CodeBlockProps) => {
  const { Code } = usePrism();
  return <Code language={language}>{children}</Code>;
};

export default CodeBlock;
