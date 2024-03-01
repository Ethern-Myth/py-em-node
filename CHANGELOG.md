# Changelog

## [1.0.1] - 2024-03-01

### Added

- Added `usePythonThree` boolean flag in the `Config` interface to indicate whether to use Python 3.
- Added `usePythonThree` parameter to `executePythonScript` function to determine whether to use Python 3.
- Now using only, examples:

```json
{
  "entryPoint": "main.py",
}
```

If using python3

```json
{
  "entryPoint": "main.py",
  "usePythonThree": true
}
```

### Changed

- Updated `executePythonScript` function to accept `usePythonThree` boolean parameter instead of `pythonVersion`.
- Modified `executePythonScript` to derive `pythonVersion` from `usePythonThree` to determine whether to use Python 3 or the default Python version.
- Modified `executeScript` function to read the `usePythonThree` flag from the configuration and pass it to `executePythonScript`.

## [1.0.0] - 2024-03-01

### Added

- Initial release of the code.
