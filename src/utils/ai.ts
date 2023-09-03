import { OpenAI } from "langchain/llms/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import dotenv from "dotenv";
import * as z from "zod";
import { PromptTemplate } from "langchain/prompts";
import { JournalEntry } from "@prisma/client";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { loadQARefineChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

if (process.env.LOAD_DOTENV === "true") {
  dotenv.config({
    path: ".env.local",
  });
}

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    mood: z.string().describe("The mood of the journal entry."),
    summary: z.string().describe("A quick summary of the journal entry."),
    color: z
      .string()
      .describe("A hexadecimal color string that represents the mood"),
    negative: z
      .boolean()
      .describe(
        "Is the journal entry negative? Does it contain mostly negative emotions?"
      ),
    sentimentScore: z
      .number()
      .describe(
        "sentiment of the text and rated on a scale from -10 to 10, where -10 is extremely negative, 0 is neutral, and 10 is extremely positive."
      ),
  })
);

const openAICompletionsModel = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo",
});

const getPrompt = async (content: string) => {
  const desired_format_instructions = parser.getFormatInstructions();

  const prompt = new PromptTemplate({
    template: `Analyze the following journal entry. Follow the instructions and format 
    your response to match the format instructions, no matter what.\n
    {format_instructions}\n
    Journal Entry:\n {entry}`,
    inputVariables: ["entry"],
    partialVariables: {
      format_instructions: desired_format_instructions,
    },
  });

  const input = await prompt.format({ entry: content });
  return input;
};

export async function analyze(journalEntry: string) {
  const prompt = await getPrompt(journalEntry);

  const res = await openAICompletionsModel.call(prompt, {});
  const result = await parser.parse(res);
  return result;
}

// analyze(
//   "I am happy today. For some reason, there's a smile on my face. I'm not sure why. I'm just happy. I finally did guitar for the first time in a month. I feel like things are looking up."
// );

export async function qa(
  entries: {
    id: string;
    createdAt: Date;
    content: string;
  }[],
  question: string
) {
  // create an array of lanchain documents, which contain all the info about every journal entry
  const docs = entries.map(
    (entry) =>
      new Document({
        pageContent: entry.content,
        metadata: { source: entry.id, date: entry.createdAt },
      })
  );
  // a chain is a series of prompts. This chain is a QA chain, which means it asks intermediate questions
  const chain = loadQARefineChain(openAICompletionsModel);
  const embeddings = new OpenAIEmbeddings();
  // creat in-memory vector database convert our docs into embeddings and then store them.
  const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
  // given a string, search the vector database for related embeddings, and return them.
  const relevantDocs = await store.similaritySearch(question);

  const res = await chain.call({
    input_documents: relevantDocs,
    question,
  });

  return res.output_text as string;
}
