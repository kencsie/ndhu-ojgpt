//https://dev.to/oyemade/getting-started-w-googles-gemini-pro-llm-using-langchain-js-4o1

const { readFile, writeFile } = require('fs').promises;
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const dotenv = require('dotenv');
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

async function solveProblem(problemPath, modelName) {
  const problem = JSON.parse(await readFile(problemPath, "utf-8"));

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

  const model = initializeModel(modelName);
  const answer = await model.invoke(formattedPromptTemplate);

  await writeFile("./data/answer.txt", answer.text);

  console.log(`Solve problem complete.`);
  return answer.text;
}

async function explainProblem(problemPath, code, modelName) {
  const problem = JSON.parse(await readFile(problemPath, "utf-8"));

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
  const explaination = await model.invoke(formattedPromptTemplate);

  await writeFile("./data/explaination.txt", explaination.text);

  console.log(`Explain problem complete.`);
}

module.exports = {
  solve: solveProblem,
  explain: explainProblem
};