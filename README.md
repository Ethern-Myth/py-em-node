# py-em-node

## Introduction

`py-em-node` is a Node.js package designed to facilitate the execution and management of Python scripts within a Node.js environment. It provides functions to install Python, read configuration files, and execute Python scripts seamlessly.

## Installation

You can install `py-em-node` via npm, yarn or pnpm:

```bash
npm install py-em-node
OR
pnpm add py-em-node
OR
yarn add py-em-node
```

## Usage

### Package.json OR Command-Line Interface (CLI)

`py-em-node` offers a command-line interface (CLI) or package.json for executing scripts directly from the terminal.

#### Example Usage

For this: Follow the Configuration Options as well

```bash
py-em-node start
```

OR

```json
"scripts": {
  "start": "py-em-node start"
 },
```

```bash
npm run start
OR
pnpm start
OR
yarn start
```

This command will execute the Python script specified as the entry point in the configuration file.

### Configuration

`py-em-node` supports configuration through a JSON or TSON file named `python.config.json` or `python.config.tson` respectively. Place this file in the root directory of your project.

#### Configuration Options

- `entryPoint`: Specifies the entry point Python file (default: `app.py`).
- `packageManager`: Specifies the package manager to use for Python installation. (package Manager: 'npm', 'yarn' or 'pnpm')

#### Example Configuration File (python.config.json)

```json
{
  "entryPoint": "main.py",
  "packageManager": "npm"
}
```

## API Reference

### executeScript(script: string): Promise<void>

Executes the specified Python script based on the provided script name.

- `script`: Name of the script to execute.

### installPython(packageManager?: string): Promise<string>

Installs Python using the specified package manager.

- `packageManager`: Optional parameter specifying the package manager to use for Python installation. If not provided, `npm` will be used by default.

### readConfig(): Config

Reads the configuration from the `python.config.json` or `python.config.tson` file and returns the configuration object.

### executePythonScript(scriptPath: string, args: string[]): void

Executes the Python script located at the specified path with the provided arguments.

- `scriptPath`: Path to the Python script.
- `args`: Array of arguments to pass to the Python script.

## License

This package is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Acknowledgements

- This package was inspired by the need to seamlessly integrate Python scripts into Node.js applications.

---

**Note:** Make sure to have Python installed on your system before using this package. If Python is not installed, `py-em-node` will attempt to install it using the specified package manager.

## Credits

[Ethern Myth](https://github.com/ethern-myth)

## 🎯 The following features are planned for future support

- Allow user to enter the requirement.txt, and let this handle the installation
- More to be added.
