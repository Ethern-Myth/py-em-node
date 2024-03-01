import fs from "fs";
import { exec, spawn } from "child_process";

interface Config {
	[key: string]: any;
}

// Function to install Python
async function installPython(packageManager?: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		const installCommand = packageManager || "npm";
		exec(`${installCommand} install python`, (error, stdout, stderr) => {
			if (error) {
				reject(`Error installing Python: ${error.message}`);
				return;
			}
			if (stderr) {
				reject(`Error installing Python: ${stderr}`);
				return;
			}
			resolve("Python installed successfully.");
		});
	});
}

// Function to read configuration
function readConfig(): Config {
	try {
		const configFile: string = fs.existsSync("python.config.json")
			? "python.config.json"
			: fs.existsSync("python.config.tson")
			? "python.config.tson"
			: "";

		if (!configFile) {
			console.error("No configuration file found.");
			return {};
		}

		const configFileContent: string = fs.readFileSync(configFile, "utf8");

		if (!configFileContent) {
			console.error("Configuration file is empty:", configFile);
			return {};
		}

		return configFile.endsWith(".json")
			? JSON.parse(configFileContent)
			: (configFileContent as any as Config);
	} catch (error) {
		console.error("Error reading configuration file:", error);
		return {};
	}
}

// Function to execute Python script
function executePythonScript(scriptPath: string, args: string[]): void {
	const pythonProcess = spawn("python", [scriptPath, ...args], {
		stdio: "inherit",
	});

	pythonProcess.on("exit", (code, signal) => {
		if (code === 0) {
			console.log("Python script execution completed successfully.");
		} else {
			console.error("Python script execution failed with code:", code);
		}
	});
}

// Function to execute Python script based on user input
async function executeScript(script: string): Promise<void> {
	const config = readConfig();
	const entryPoint: string = config.entryPoint || "app.py"; // Default entry file
	const packageManager: string | undefined = config.packageManager; // Get package manager from config

	switch (script) {
		case "dev":
			console.log("Development mode not implemented yet.");
			break;
		case "build":
			console.log("Build mode not implemented yet.");
			break;
		case "start":
			// Install Python if not already installed
			if (!fs.existsSync("python")) {
				await installPython(packageManager);
			}
			// Start the Python script using the entry point specified in config
			executePythonScript(entryPoint, []);
			break;
		default:
			console.error("Invalid script:", script);
			break;
	}
}

export { executeScript };
