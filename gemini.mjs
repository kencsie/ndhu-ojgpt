import { readFile, writeFile } from 'fs/promises';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import * as dotenv from "dotenv";
dotenv.config();

async function solveProblem(problem) {
  const template = `You are a coding genius. Help the user to solve the code problem using C++:{problem}`;

  const promptTemplate = new PromptTemplate({
    template,
    inputVariables: ["problem"],
  });

  const geminiModel = new ChatGoogleGenerativeAI({
    modelName: "gemini-1.0-pro",
  });


  const llmChain = new LLMChain({
    llm: geminiModel,
    prompt: promptTemplate,
  });


  const result = await llmChain.call({
    problem: problem,
  });

  console.log(result);

  return result;
}



(async () => {
  const problem = await readFile("problem.txt", "utf-8");
  const answer = await solveProblem(problem);
  await writeFile("answer.txt", answer.text);
})();