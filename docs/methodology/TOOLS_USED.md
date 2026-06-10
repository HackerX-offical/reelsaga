# Tools Used

| Tool | Version | Purpose |
|------|---------|---------|
| unzip | system | Extract XAPK/APK zip |
| strings | system | Binary string extraction |
| ripgrep (`rg`) | system | Pattern search |
| apktool | 3.0.2 | Manifest + resources + smali |
| jadx | 1.5.5 | DEX → Java decompilation |
| curl | system | Proof-of-abuse API calls |
| bash | 5.x | Automation scripts |

Install on macOS:

```bash
brew install apktool jadx ripgrep
```

All scripts: `scripts/`
