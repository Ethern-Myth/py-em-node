import fs from "fs";
import { spawnSync } from "child_process";
import path from "path";

async function generateSSLCertificates(distDirectory: string) {
	const sslDir = path.join(distDirectory, "ssl");
	try {
		// Ensure the sslDir exists or create it if it doesn't
		if (!fs.existsSync(sslDir)) {
			fs.mkdirSync(sslDir, { recursive: true });
		} else if (!fs.statSync(sslDir).isDirectory()) {
			throw new Error(`${sslDir} exists but is not a directory`);
		}

		const opensslArgs = [
			"req",
			"-nodes",
			"-new",
			"-x509",
			"-keyout",
			path.join(sslDir, "server.key"),
			"-out",
			path.join(sslDir, "server.cert"),
			"-days",
			"365",
			"-subj",
			"/C=US/ST=New York/L=New York/O=Organization/OU=IT Department/CN=*",
		];

		const opensslResult = spawnSync("openssl", opensslArgs, {
			stdio: "inherit",
		});

		if (opensslResult.status !== 0) {
			throw new Error(
				`Error generating SSL certificates: ${opensslResult.error}`
			);
		}

		console.log("SSL certificates generated successfully.");
	} catch (error) {
		console.error("Error generating SSL certificates:", error);
	}
}

export { generateSSLCertificates };
