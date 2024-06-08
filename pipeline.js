const dotenv = require('dotenv');
let getProblem = require('./get_problem');
let solveProblem = require('./solve_problem');
let submitProblem = require('./submit_problem');

dotenv.config();
const OJ_URL = "http://134.208.3.66/"
const problemID = "05";
const modelName = "gpt-4"; //"gemini-1.5-pro" or "gpt-4"
const problemPath = "./data/problem.json";
const answerPath = './data/answer.txt';
const Username = modelName === "gpt-4" ? process.env.OJ_GPT_USERNAME : process.env.OJ_GEMINI_USERNAME;
const Password = modelName === "gpt-4" ? process.env.OJ_GPT_PASSWORD : process.env.OJ_GEMINI_PASSWORD;

(async () => {
  await getProblem(problemID, OJ_URL);
  const answer = await solveProblem.solve(problemPath, modelName);
  await solveProblem.explain(problemPath, answer, modelName);
  await submitProblem(answerPath, problemID, OJ_URL,{ username: Username, password: Password });
})();