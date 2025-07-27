process.stdin.setMaxListeners(0); //Temp fix for handling max listeners error that happens when user doesnt answer any questions
process.stdout.setMaxListeners(0); 

import chalk from "chalk";
import { select } from "@inquirer/prompts";
import { questions } from "./questions.js";
import readline from "readline";

export async function showMainMenu(gameState){
    const action = await select({
        message: "Main Menu",
        choices: [
            {name: "Start Game", value: "start"},
            {name: "See Stats", value: "stats"},
            {name: "Reset Stats", value: "reset"},
            {name: "Quit", value: "quit"},
        ],
    });

    switch(action){
        case "start":
            await startGame(gameState);
            break;
            case "stats":
                showStats(gameState);
                await select({message: "Press Enter to go back", choices: [{name: "Back", value: "back"}]});
                await showMainMenu(gameState);
                break;
                case "reset":
                    resetStats(gameState);
                    await showMainMenu(gameState);
                break;
                case "quit":
                    console.log(chalk.cyanBright("Goodbye"));
                    process.exit(0);
    }
}

export async function timedQuestion(question, timeout = 10000) {
  let timeLeft = timeout / 1000;
  let timerInterval;
  let timeoutId;
  let resolved = false; 

  //Start the prompt first 
  const answerPromise = select({
    message: question.question,
    choices: question.choices.map((choice) => ({
      name: choice,
      value: choice,
    })),
  });

  //I used draw here to display the countdown in a fixed position rather than printing a new line for each time update
  function drawTimer() {
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(chalk.yellow(`Time remaining: ${timeLeft}s`));
  }

  drawTimer(); 

  //Function for the actual countdown
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft === 0) return;
    drawTimer();
  }, 1000);

  //Timeout Promise
  const timeoutPromise = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      if (resolved) return; //Prevent firing more than once
      resolved = true;
      clearInterval(timerInterval);
      readline.cursorTo(process.stdout, 0);
      readline.clearLine(process.stdout, 0); 
      
      resolve(null);
    }, timeout);
  });

  //Waits for answer or timer
  const result = await Promise.race([answerPromise, timeoutPromise]);

  //Clears out the timers 
  if (!resolved) {
    resolved = true;
    clearTimeout(timeoutId);
    clearInterval(timerInterval);
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);
  } 
    return result;                                  
}

//Starts the game
export async function startGame(gameState){
    console.log(chalk.cyanBright("\nWelcome to the Trivia Game!\n"));

    for(const question of questions) {
        const userAnswer = await timedQuestion(question, 10000); //Calls the timer function and uses question / interval for inputs 

        //If user doesnt make a selection should display Opps! Out of time! and get pushed to the unanswered array 
        if(userAnswer === null){
            console.log(chalk.red("\nOpps! Out of time!\n"));
            gameState.stats.unanswered.push({
                userAnswer,
            });
        } else if (userAnswer === question.answer){ //If the answer is correct push the results to the correct array
            console.log(chalk.green("\nCorrect!\n"));
            gameState.stats.correct.push({
                userAnswer,
            });
        } else { //If the answer is incorrect push results to the incorrect array
            console.log(chalk.red("\nIncorrect!\n"));
            gameState.stats.incorrect.push({
                userAnswer,
            });
        } 
    }
    //Notify user of completion and option to return to main menu
    console.log(chalk.cyanBright("\nYou've compeleted the game!\n"));
    await select({
        message: "Press Enter to return to the main menu",
        choices: [{name: "Back to Menu", value: "menu"}],
    });
    await showMainMenu(gameState);
}


//Displays user stats 
function showStats(gameState){
    const correctCount = gameState.stats.correct.length;
    const incorrectCount = gameState.stats.incorrect.length;
    const unanswered = gameState.stats.unanswered.length;

    console.log(chalk.green(`Correct: ${correctCount}`), chalk.red(`Incorrect: ${incorrectCount}`), chalk.yellow(`Unanswered: ${unanswered}`));
}

//Resets all user stats 
function resetStats(gameState){
    gameState.stats.correct = [];
    gameState.stats.incorrect = [];
    gameState.stats.unanswered = [];
    console.log("Game stats have been reset");
}