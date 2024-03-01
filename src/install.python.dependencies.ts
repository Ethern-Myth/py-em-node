import { execSync } from "child_process";
import fs from "fs";

export function installDependencies() {
	try {
		// Read python.config.tson to get Python dependencies
		const config = JSON.parse(fs.readFileSync("python.config.tson", "utf8"));
		const pythonDeps: string[] = config.pythonDependencies || [];

		// Determine the Python executable based on the environment
		let pythonExecutable = "python";
		if (process.platform === "win32") {
			// On Windows, check if python3 is available
			try {
				execSync("python3 --version");
				pythonExecutable = "python3";
			} catch (error) {
				// Fall back to python if python3 is not available
				pythonExecutable = "python";
			}
		}

		// Get Python version to handle version-specific commands if needed
		const pythonVersionOutput = execSync(
			`${pythonExecutable} --version`
		).toString();
		const match = pythonVersionOutput.match(/(\d+\.\d+)/);
		const pythonVersion = match ? parseFloat(match[1]) : null;

		// Install Python dependencies using the appropriate Python executable
		if (pythonDeps.length > 0) {
			if (pythonVersion !== null && pythonVersion >= 3.0) {
				execSync(`${pythonExecutable} -m pip install ${pythonDeps.join(" ")}`);
			} else {
				execSync(`${pythonExecutable} -m pip install ${pythonDeps.join(" ")}`);
			}
			console.log("Python dependencies installed successfully!");
		} else {
			console.log("No Python dependencies specified.");
		}
	} catch (error) {
		console.error("Error installing Python dependencies:", error);
	}
}
