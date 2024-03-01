import fs from "fs";
import path from "path";

export async function bundlePythonApp(sourceDir: string, targetDir: string) {
	try {
		await copyNonPythonFiles(sourceDir, targetDir);
		console.log("Python project bundled successfully.");
	} catch (error) {
		console.error("Error bundling Python project:", error);
	}
}

async function copyNonPythonFiles(sourceDir: string, targetDir: string) {
	const files = await fs.readdirSync(sourceDir);
	for (const file of files) {
		const sourcePath = path.join(sourceDir, file);
		const targetPath = path.join(targetDir, file);
		const stats = await fs.statSync(sourcePath);
		if (stats.isDirectory()) {
			// Recursively copy directory
			await fs.mkdirSync(targetPath, { recursive: true });
			await copyNonPythonFiles(sourcePath, targetPath);
		} else if (!isPythonFile(file)) {
			// Copy non-Python files
			await fs.copyFileSync(sourcePath, targetPath);
		}
	}
}

function isPythonFile(file: string) {
	return [".py", ".pyc", ".pyo", ".pyd"].some((ext) => file.endsWith(ext));
}
