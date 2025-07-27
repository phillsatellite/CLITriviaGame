#!/user/bin/env node 

import {program} from "commander";
import gameState from "../src/gameState.js";
import { showMainMenu, startGame, /*showStats,*/ /*resetStats*/ } from "../src/gameLogic.js";

program 
    .name("Trivia")
    .description("Trivia Game in CLI")
    .version("1.0.0");

//To start the game
program
    .command("start")
    .description("Start the game")
    .action(() => {
        startGame(gameState);
    });

//To show the game stats 
program 
    .command("stats")
    .description("Show game stats")
    .action(() => {
        showStats(gameState);
    });

//To reset the game stats 
program 
    .command("reset")
    .description("Reset Stats")
    .action(() => {
        resetStats(gameState);
    });

//If no input is given then show main menu 
program 
    .action(() => {
        showMainMenu(gameState);
    });

showMainMenu(gameState);