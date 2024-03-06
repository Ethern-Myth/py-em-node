import fs from "fs";
import { exec, spawn } from "child_process";

interface Config {
	usePythonThree?: boolean;
	entryPoint?: string;
}

async function isPythonInstalled(pythonVersion?: string): Promise<boolean> {
	const pythonExecutable = pythonVersion ? `python${pythonVersion}` : "python";

	return new Promise<boolean>((resolve) => {
		exec(`${pythonExecutable} --version`, (error) => {
			if (!error) {
				resolve(true); // Python executable found
			} else {
				resolve(false); // Python executable not found
			}
		});
	});
}

// Function to read configuration
function readConfig(): Config {
	try {
		const configFile: string = fs.existsSync("python.config.json") ? "python.config.json": "";

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

async function executePythonScript(
	scriptPath: string,
	args: string[],
	usePythonThree?: boolean
): Promise<void> {
	const pythonVersion = usePythonThree ? "3" : "";

	const isInstalled = await isPythonInstalled(pythonVersion);
	if (!isInstalled) {
		throw new Error(`Python ${pythonVersion} is not installed.`);
	}

	const pythonExecutable = pythonVersion ? `python${pythonVersion}` : "python";
	const pythonProcess = spawn(pythonExecutable, [scriptPath, ...args], {
		stdio: "inherit",
	});

	return new Promise<void>((resolve) => {
		pythonProcess.on("exit", (code) => {
			if (code === 0) {
				console.log("Python script execution completed successfully.");
			} else {
				console.error("Python script execution failed with code:", code);
			}
			resolve();
		});
	});
}

async function executeScript(script: string): Promise<void> {
	const config = readConfig();
	const usePythonThree = config.usePythonThree || false;
	const entryPoint = config.entryPoint || "app.py";

	switch (script) {
		case "start":
			try {
				await executePythonScript(entryPoint, [], usePythonThree);
			} catch (error) {
				console.error("Error starting Python script:", error);
			}
			break;
		default:
			console.error("Invalid script:", script);
			break;
	}
}

export { executeScript };
