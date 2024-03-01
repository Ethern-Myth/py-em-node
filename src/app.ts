import fs from "fs";
import { spawnSync, spawn, exec } from "child_process";
import path from "path";
import express, { Request, Response } from "express";
import https from "https";
import ip from "ip";
import glob from "glob";
import { generateSSLCertificates } from "./ssl";
import { installDependencies } from "./install.python.dependencies";
import { bundlePythonApp } from "./bundle";

interface Config {
	language?: string;
	dev?: {
		port?: number;
	};
	entryPoint?: string;
	pythonDependencies?: string[];
	build?: {
		outputDirectory?: string;
	};
	[key: string]: any;
}

interface RequestOptions {
	key: Buffer;
	cert: Buffer;
}

interface TranspileResult {
	status: number | null;
	error?: Error | undefined;
}

async function executeScript(script: string) {
	switch (script) {
		case "dev":
			await startDevServer();
			break;
		case "build":
			await buildProduction();
			break;
		case "start":
			await startProductionServer();
			break;
		default:
			console.error("Invalid script:", script);
			break;
	}
}

function readConfig(): Config {
	try {
		let configFileContent;
		try {
			configFileContent = fs.readFileSync("python.config.json", "utf8");
		} catch (jsonError) {
			try {
				configFileContent = fs.readFileSync("python.config.tson", "utf8");
			} catch (tsonError) {
				throw new Error("Error reading configuration file: " + tsonError);
			}
		}
		return JSON.parse(configFileContent);
	} catch (error) {
		console.error("Error parsing configuration file:", error);
		return {};
	}
}

async function startDevServer() {
	const config: Config = readConfig();
	const entryFile = config.entryPoint || "app.py"; // Default entry file
	const port = config.dev && config.dev.port ? config.dev.port : 3000;
	const installCommand = config.packageManager || "npm";

	if (await !fs.existsSync(path.join("node_modules", ".bin", "transcrypt"))) {
		// Transcrypt is not installed, install it
		const installTranscryptProcess = spawn(installCommand, [
			"install",
			"transcrypt",
		]);

		installTranscryptProcess.on("exit", (code, signal) => {
			if (code === 0) {
				// Transcrypt installed successfully, start the server
				transpileAndStartServer(port, entryFile, config.language);
			} else {
				console.error("Failed to install Transcrypt.");
			}
		});
	} else {
		// Transcrypt is installed, start the server
		transpileAndStartServer(port, entryFile, config.language);
	}
}

function transpileAndStartServer(
	port: number,
	entryFile: string,
	language?: string
) {
	// Transpile Python to JavaScript using Transcrypt
	const transcryptProcess = spawn("transcrypt", ["-b", "-m", entryFile], {
		stdio: "inherit",
	});

	transcryptProcess.on("exit", (code, signal) => {
		if (code === 0) {
			// Transpilation successful, convert to the specified language if provided
			if (language && language.toLowerCase() === "typescript") {
				convertToTypeScript(
					entryFile.replace(/\.py$/, ".js"),
					entryFile.replace(/\.py$/, ".ts")
				);
			}
			// Start the server
			startServer(port, entryFile);
		} else {
			console.error("Transpilation failed with code:", code);
		}
	});
}

function convertToTypeScript(inputFile: string, outputFile: string) {
	const convertProcess = spawn("js-to-ts", [inputFile, outputFile], {
		stdio: "inherit",
	});

	convertProcess.on("exit", (code, signal) => {
		if (code === 0) {
			console.log("Conversion to TypeScript successful.");
		} else {
			console.error("Conversion to TypeScript failed with code:", code);
		}
	});
}

function startServer(port: number, entryFile: string) {
	const app = express();
	// Serve the directory containing the transpiled JavaScript/TypeScript files
	app.use(express.static("__target__"));

	// Route for serving the transpiled JavaScript/TypeScript file
	app.get("/", (req: Request, res: Response) => {
		res.sendFile(entryFile.replace(/\.py$/, ".js").replace(/\.ts$/, ".js"), {
			root: "__target__",
		});
	});

	// Start the development server
	app.listen(port, () => {
		console.log(`Development server running at http://localhost:${port}`);
	});
}

async function buildProduction() {
	console.log("Building production files...");
	const config: Config = readConfig();
	const sourceDir = config.sourceDir;
	const outputDirectory = config.build?.outputDirectory || "build";

	// Install Python dependencies
	installDependencies();

	// Transpile Python code to JavaScript (assuming a transpilePythonCode function)
	const transpileResult = transpilePythonCode(sourceDir, outputDirectory);

	if (transpileResult.status !== 0) {
		console.error("Error transpiling Python code:", transpileResult.error);
		return;
	}

	// Bundle assets/resources for the Python app (assuming a bundlePythonApp function)
	await bundlePythonApp(sourceDir!, outputDirectory);

	await minifyJavaScriptFiles(outputDirectory);

	console.log("Production files built successfully.");
}

async function minifyJavaScriptFiles(outputDirectory: string) {
	const jsFiles = await fs
		.readdirSync(outputDirectory)
		.filter((file) => file.endsWith(".js"));
	jsFiles.forEach((jsFile) => {
		const filePath = path.join(outputDirectory, jsFile);
		const minifiedFilePath = path.join(
			outputDirectory,
			jsFile.replace(".js", ".min.js")
		);
		const terserProcess = spawnSync("terser", [
			filePath,
			"-o",
			minifiedFilePath,
		]);
		if (terserProcess.status !== 0) {
			console.error("Error minifying JavaScript:", terserProcess.error);
			return;
		}
	});
}

function transpilePythonCode(
	sourceDir: string,
	outputDirectory: string
): TranspileResult {
	try {
		// Get a list of all Python files in the source directory
		const pythonFiles = glob.sync("**/*.+(py|pyc|pyo|pyd)", { cwd: sourceDir });

		// Iterate over each Python file and transpile it
		for (const pythonFile of pythonFiles) {
			const outputFilePath = path.join(
				outputDirectory,
				pythonFile.replace(/\.(py|pyc|pyo|pyd)$/, ".js")
			);
			const transcryptProcess = spawnSync(
				"transcrypt",
				["-b", "-m", pythonFile, "-o", outputFilePath],
				{ stdio: "inherit", cwd: sourceDir }
			);

			// Check the exit status of the process
			if (transcryptProcess.status !== 0) {
				return {
					status: transcryptProcess.status,
					error: new Error(`Transpilation of ${pythonFile} failed`),
				};
			}

			if (!fs.existsSync(outputFilePath)) {
				return {
					status: -1,
					error: new Error(
						`Transpilation output file not found for ${pythonFile}`
					),
				};
			}
		}

		// Return success status
		return { status: 0 };
	} catch (error: any) {
		// Return error if an exception occurs
		return { status: -1, error };
	}
}

async function startProductionServer() {
	const config: Config = readConfig();
	const distDirectory =
		config.build && config.build.outputDirectory
			? config.build.outputDirectory
			: "build";

	// Get the IP address of the machine
	const ipAddress = ip.address();

	// Find an available port starting from 3000
	let port = 3000;
	while (true) {
		if (!(await isPortTaken(port))) break;
		port++;
	}

	const options: RequestOptions = {
		key: fs.readFileSync(path.join(__dirname, "ssl", "server.key")),
		cert: fs.readFileSync(path.join(__dirname, "ssl", "server.cert")),
	};

	generateSSLCertificates(distDirectory);

	https
		.createServer(options, (req, res) => {
			res.writeHead(200, { "Content-Type": "text/plain" });
			res.end("Production server running");
		})
		.listen(port, ipAddress);

	console.log(`Production server running at https://${ipAddress}:${port}`);
}

async function isPortTaken(port: number): Promise<boolean> {
	const net = require("net");
	return new Promise((resolve) => {
		const server = net
			.createServer()
			.once("error", () => resolve(true))
			.once("listening", () => {
				server.close();
				resolve(false);
			})
			.listen(port);
	});
}

export { executeScript };
