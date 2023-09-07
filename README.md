# What I learned

- [What I learned](#what-i-learned)
  - [Environment Variables](#environment-variables)
  - [Clerk Auth](#clerk-auth)
    - [1. Create a Clerk App](#1-create-a-clerk-app)
    - [2. Install dependencies](#2-install-dependencies)
    - [3. Copy and paste env variables](#3-copy-and-paste-env-variables)
    - [4. Wrap your app in a `<ClerkProvider>` component](#4-wrap-your-app-in-a-clerkprovider-component)
    - [5. Create a middleware](#5-create-a-middleware)
    - [6. Creating signing up and signing in](#6-creating-signing-up-and-signing-in)
      - [Add sign up route](#add-sign-up-route)
      - [Add sign in route](#add-sign-in-route)
      - [Add routing env variables](#add-routing-env-variables)
  - [PlanetScale and Prisma](#planetscale-and-prisma)
    - [PlanetScale Setup](#planetscale-setup)
    - [Prisma Setup](#prisma-setup)
    - [Prisma Schemas](#prisma-schemas)
      - [User](#user)
      - [Entry](#entry)
  - [Actual working code block](#actual-working-code-block)
  - [Autosave feature](#autosave-feature)
  - [Running individual files with ts-node](#running-individual-files-with-ts-node)
  - [AI](#ai)
    - [Prompt engineering tips](#prompt-engineering-tips)
    - [Langchain INstall](#langchain-install)
    - [LLM: completion](#llm-completion)
    - [LLM: completion with desired format](#llm-completion-with-desired-format)
      - [1. Define the desired format output using zod](#1-define-the-desired-format-output-using-zod)
      - [2. Define a more powerful prompt](#2-define-a-more-powerful-prompt)
      - [3. Use the LLM and run the model on the prompt, getting back on the response](#3-use-the-llm-and-run-the-model-on-the-prompt-getting-back-on-the-response)
  - [Deployment](#deployment)

## Environment Variables

All env variables prefixed with `NEXT_PUBLIC_` are exposed to the browser and are available on the frontend to use. Anything not prefixed with it is kept secret and only accessible to the server.

## Clerk Auth

### 1. Create a Clerk App

### 2. Install dependencies

```bash
npm install @clerk/nextjs
```

### 3. Copy and paste env variables

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YnJpZ2h0LWthdHlkaWQtOTcuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=blablabla
```

### 4. Wrap your app in a `<ClerkProvider>` component

```javascript
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### 5. Create a middleware

Clerk will use your `middleware.ts` to define authenticated and unauthenticated routes. You can configure this by passing in options to the middleware.

```javascript
import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  publicRoutes: ["/"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### 6. Creating signing up and signing in

#### Add sign up route

Create a `page.tsx` at the `sign-up/[[...sign-up]]` path. The `<SignUp>` component from clerk renders the auth sign up form.

```javascript
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return <SignUp afterSignUpUrl={"/new-user"} />;
}
```

#### Add sign in route

Create a `page.tsx` at the `sign-in/[[...sign-in]]` path. The `<SignIn>` component from clerk renders the auth sign up form.

```javascript
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return <SignIn />;
}
```

#### Add routing env variables

You can change these routing urls to whatever you want for your auth flow

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## PlanetScale and Prisma

Why we are using planetscale is because it handles all of the database migrations for you instead of prisma. We will never have to run any `npx prisma migrate` commands.

We only have to push to the production database using `npx prisma db push`.

### PlanetScale Setup

1. Install the planetscale CLI using scoop, but I guess I already did that. So just run `pscale` in your terminal to see if it works.
2. Run `pscale auth login` to login to your planetscale account.
3. Create a new branch in your pscale database so that you're not using a production branch.
4. Run `pscale connect <database-name> <branch-name> --port 3309` to run the database locally on port 3309. Substitute the database name and branch name with your own, for example, `journalnextjs` and `dev`

### Prisma Setup

1. Install these dependencies:

```bash
npm install @prisma/client
npm i -D prisma
```

2. Run `npx prisma init`
3. Make your `schema.prisma` look like this:

```prisma
generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "mysql"
  url = env("DATABASE_URL")
  relationMode = "prisma"
}
```

4. Substitute your database env variable for the local database URL your database is running on.

```bash
DATABASE_URL="mysql://root@127.0.0.1:3309/journalnextjs"
```

5. ANy time you make a change to your prisma schema, you have to make planetscale know about it by running `npx prisma db push` to push up schema changes to the database.

### Prisma Schemas

TODO: explain what each of these schemas do

#### User

```prisma
model User {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  email     String   @unique
  name      String?
  entries   Entry[]
}
```

#### Entry

```prisma
model Entry {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  title     String
  body      String
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
}
```

## Actual working code block

Run `npm i next-prism` to install the `usePrism()` hook, and then I made a custom component like this. It must be a client component.

```javascript
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
```

## Autosave feature

Here are the basic steps of an autosave feature:

1. Create state/ref to keep track of whether the user is typing or not
2. On the `onChange` event whenever the user is typing, set the typing state/ref to true
3. Create a useEffect that runs every 5 seconds on an interval to save the entry by requesting an API call to our server
4. After calling the API, we set the state/ref to false to indicate that the user is no longer typing
5. When the component unmounts in the useEffect, clear the interval.

```javascript
const Editor = ({ journalEntry }: EditorProps) => {
  const [value, setValue] = React.useState < string > journalEntry.content;
  const [saving, setSaving] = React.useState < boolean > false;
  // isTyping ref to keep track of typing state
  const isTyping = React.useRef < boolean > false;
  const [analysis, setAnalysis] =
    (React.useState < Analysis) | (null > (journalEntry.analysis || null));

  // call to database
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
    // 1. Set autosave to true
    // 2. Fetch data from database, saving content
    // 3. Set autosave to false
    // 4. Set typing to false
    async function bruh() {
      setSaving(true);
      const entry = await saveEntry();
      setAnalysis(entry.analysis);
      setSaving(false);
      isTyping.current = false;
    }
    // run every 5 seconds. If you're
    const interval = setInterval(() => {
      if (isTyping.current) {
        bruh();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [value, journalEntry.id]);

  return (
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
          // in the onChange event, set the typing ref to true
          setValue(e.target.value);
          isTyping.current = true;
        }}
      ></textarea>
    </div>
  );
};

export default Editor;
```

## Running individual files with ts-node

1. Install dependencies

```bash
npm install -D ts-node  # to run typescript files
npm i -D dotenv   # to load env variables if necessary
npm i -D crossenv  # to set env variables if we want
```

2. Create another tsconfig json, name it something else, like `tsconfig-ai.json`, and put this:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "incremental": true,
    "esModuleInterop": true,
    "module": "CommonJS",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/styles/*": ["./src/styles/*"],
      "@/prisma/*": ["./src/prisma/*"],
      "@/assets/*": ["./src/assets/*"]
    }
  },
  "include": ["next-env.d.ts", ".next/types/**/*.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

3. If you need to load env variables in the file you're testing, you need to set up dotenv

```javascript
import dotenv from "dotenv";
dotenv.config({
  path: ".env.local",
});
```

4. To prevent loading dotenv when just running the nextJS app normally, use the `crossenv` dependency to set env variables in windows. In your `package.json`, add this:

```json
  "scripts": {
    "ai": "cross-env LOAD_DOTENV=true ts-node -P tsconfig-ai.json -r tsconfig-paths/register --transpileOnly src/utils/ai.ts"
  },
```

5. You can then conditionally use dotenv in your file like so:

```javascript
if (process.env.LOAD_DOTENV) {
  dotenv.config({
    path: ".env.local",
  });
}
```

## AI

### Prompt engineering tips

- Put "no matter what" to force the ai to do your bidding and heed yoru instructions

### Langchain INstall

1. `npm install -S langchain`

### LLM: completion

When using the `llm` module from langchain, we are basically using **completion** models, good for one-off answers where we ask the model to do something and then we're done.

```javascript
import { OpenAI } from "langchain/llms/openai";

const llm = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
});
```

You can then use a basic kind of prompt call like so:

```javascript
async function analyze(journalEntry: string) {
  const prompt = `You are an experienced journal entry analyzer. I will 
    give you a journal entry and your job is to analyze it and give me back data in my desired format. I want back the analyzed mood of the entry, a quick summary of the journal entry that is less than 10 words, and a hexadecimal color string that represents the mood. I also want a boolean that represents if the mood is negative or not. Do not include any other output in your response excpet for the JSON array structure I will specify below

    Desired Format: Json array like {mood: string, summary: string, color: string, negative: boolean}
    
    Here is the entry: ${journalEntry}

    Output: 
    `;

  const res = await llm.call(prompt);
  const data = JSON.parse(res);
}
```

- `llm.call(prompt)` : taking in a prompt string, gets the result of sending the specified prompt to the model. The text response is then returned.

### LLM: completion with desired format

Langchain has a zod integration helper to coerce chatGPT into giving back the output in our desired format. The steps are as follows:

1. Define the desired format output using zod
2. Use the LLM and run the model on the prompt, getting back on the response
3. Use the zod helper to parse the response and get back the result in the exact desired format.

Here are those steps in detail:

#### 1. Define the desired format output using zod

We import the `StructuredOutputParser` from the "langchain/output_parsers" module.

We then use the `Sp.fromZodSchema()` method to pass in a zod schema. For each field, we have to describe the purpose of it so chatGPT can pick up on the types of values to create for it.

We do this using the zod `z.describe()` chained method

- Describe each field using something like `z.string().describe("description")`

```javascript
import { StructuredOutputParser as Sp } from "langchain/output_parsers";
import * as z from "zod";

const parser = Sp.fromZodSchema(
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
```

Once the parser is created, we can get back format instructions form `parser.getFormatInstructions()`. This is a string that langchain makes for us to inject into our prompt to coerce the model into giving us back the desired format.

#### 2. Define a more powerful prompt

```javascript
import { PromptTemplate } from "langchain/prompts";

const getPrompt = async (content: string) => {
  // 1. Get the prompt injected format instructions to coerce the zod schema
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

  const newPrompt = await prompt.format({ entry: content });
  return newPrompt;
};
```

1. Get back the desired format instructions
2. Create a prompt template using the `PromptTemplate` class, passing in the template. In this string, define variables for later inject using `{}` syntax. You have to match the name later. This method returns a `prompt` object.
3. Get back the finished prompt using `prompt.format()`, passing in an object with the variables you want to inject into the prompt.

#### 3. Use the LLM and run the model on the prompt, getting back on the response

```javascript
export async function analyze(journalEntry: string) {
  // 1. get the finished prompt
  const prompt = await getPrompt(journalEntry);
  // 2. run the model
  const res = await openAICompletionsModel.call(prompt, {});
  // 3. parse the output and extract it from result
  const result = await parser.parse(res);
  return result;
}
```

- `parser.parse(res: string)` : parses the string to extract the desired format output. Returns an object with the desired format output.

## Deployment

1. Merge your branch to the main branch in planetscale.
2. Click connect with prisma to get the prisma database production url, and set that in your env variables.
3. In your build script, always do `npx prisma generate` before building, so you would combine it like `npx prisma generate && next build`.
