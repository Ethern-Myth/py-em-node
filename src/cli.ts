#!/usr/bin/env node
import { executeScript } from "./index";

// Parse command-line arguments
const args = process.argv.slice(2);

// Validate and execute the command
if (args.length === 0) {
	console.error("Error: Please provide a script name (e.g., start).");
	process.exit(1);
}

const script = args[0];

// Execute the script
executeScript(script).catch((error: Error) => {
	console.error("Error executing script:", error.message);
	process.exit(1);
});
