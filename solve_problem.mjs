//https://dev.to/oyemade/getting-started-w-googles-gemini-pro-llm-using-langchain-js-4o1

import { readFile, writeFile } from 'fs/promises';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate} from "@langchain/core/prompts";
import * as dotenv from "dotenv";
dotenv.config();


function initializeModel(modelName) {
  switch (modelName) {
    case "gemini-1.5-pro":
      return new ChatGoogleGenerativeAI({ modelName });
    case "gpt-4":
      return new ChatOpenAI({ modelName });
    default:
      throw new Error("Unsupported model");
  }
}

async function solveProblem(problem, modelName) {
  const template = `
You are a coding genius. Help the user to solve the code problem using C++:
Description:{description}
Input:{input}
Output:{output}
Sample Input:{sampleInput}
Sample Output:{sampleOutput}
Code Template:{codeTemplate}
Note: Only show the output code.
  `;
  const promptTemplate = new PromptTemplate({
    template,
    inputVariables: ["description", "input", "output", "sampleInput", "sampleOutput", "codeTemplate"],
  });
  const formattedPromptTemplate = await promptTemplate.format({
    description: "\n"+problem['Description'],
    input: "\n"+problem.Input,
    output: "\n"+problem.Output,
    sampleInput: "\n"+problem.SampleInput,
    sampleOutput: "\n"+problem.SampleOutput,
    codeTemplate: "\n"+problem.CodeTemplate,
  });

  console.log(`Prompt:${formattedPromptTemplate}`);

  const model = initializeModel(modelName);
  const result = await model.invoke(formattedPromptTemplate);

  return result;
}

async function explainProblem(problem, code, modelName) {
  const template = `
Please explain the answer code, also provide user the learning resources to solve the problem using C++:
Description:{description}
Code:{code}
  `;
  const promptTemplate = new PromptTemplate({
    template,
    inputVariables: ["description", "code"],
  });
  const formattedPromptTemplate = await promptTemplate.format({
    description: "\n"+problem['Description'],
    code: "\n"+code,
  });
  console.log(`Prompt:${formattedPromptTemplate}`);

  const model = initializeModel(modelName);
  const result = await model.invoke(formattedPromptTemplate);

  return result;
}


(async () => {
  //const modelName = process.env.LLM_MODEL_NAME || "gemini-1.5-pro"; // Set default or get from .env
  const modelName = process.env.LLM_MODEL_NAME || "gpt-4";
  const problemData = JSON.parse(await readFile("./data/problem.json", "utf-8"));
  const answer = await solveProblem(problemData, modelName);
  const explaination = await explainProblem(problemData, answer.text, modelName);
  await writeFile("./data/answer.txt", answer.text);
  await writeFile("./data/explaination.txt", explaination.text);
})();