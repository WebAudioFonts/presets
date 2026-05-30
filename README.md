![WebAudioFonts](https://webaudiofonts.com/images/logo.svg)

# WebAudioFonts — Deploy Template

> **One-click pipeline to convert `.sf2` SoundFont files into browser-ready JSON and publish them on GitHub Pages.**

Fork this repository, drop your `.sf2` files in, enable three GitHub settings, and every push automatically converts and deploys your soundfonts to a static CDN — no local tooling required.

---

## Table of Contents

- [WebAudioFonts — Deploy Template](#webaudiofonts--deploy-template)
	- [Table of Contents](#table-of-contents)
	- [How It Works](#how-it-works)
	- [Repository Structure](#repository-structure)
	- [Quick Start](#quick-start)
		- [1. Fork the Repository](#1-fork-the-repository)
		- [2. Enable Git LFS](#2-enable-git-lfs)
		- [3. Add Your SoundFonts](#3-add-your-soundfonts)
		- [4. Enable GitHub Actions](#4-enable-github-actions)
		- [5. Enable GitHub Pages](#5-enable-github-pages)
	- [Accessing Your Deployed Fonts](#accessing-your-deployed-fonts)
	- [CI/CD Pipeline Details](#cicd-pipeline-details)
	- [Local Development](#local-development)
	- [Troubleshooting](#troubleshooting)
	- [License](#license)

---

## How It Works

```
soundfonts/*.sf2
	   │
	   ▼  (GitHub Actions — on every push to main)
  sf2 → JSON conversion (Node.js)
	   │
	   ▼
  GitHub Pages
	   │
	   ▼
  https://<your-username>.github.io/<your-repo>/
```

The included GitHub Actions workflow triggers on every push to `main`. It reads all `.sf2` files from the `soundfonts/` directory, converts each one to the WebAudioFont JSON format, and publishes the output to GitHub Pages via the `gh-pages` deployment environment.

---

## Repository Structure

```
deploy-template/
├── .github/
│   └── workflows/
│       └── pages.yml           # CI/CD pipeline definition
├── scripts/
│   └── ...                     # sf2-to-JSON conversion scripts (Node.js)
├── soundfonts/
│   └── .gitkeep                # Place your .sf2 files here
├── .gitattributes              # Git LFS tracking rules for *.sf2
├── .gitignore
├── package.json
└── README.md
```

---

## Quick Start

### 1. Fork the Repository

Click **Fork** at the top right of this page. Make sure to fork into your personal account or organization — not just clone.

> **Do not rename the `soundfonts/` directory.** The conversion script resolves `.sf2` paths relative to this folder.

---

### 2. Enable Git LFS

SoundFont files are binary and can be large (often tens to hundreds of MB). This repository uses **Git Large File Storage (LFS)** to handle them efficiently.

**On your local machine**, before adding any `.sf2` files:

```bash
# Install Git LFS if not already installed
git lfs install

# Clone your fork
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

The `.gitattributes` file already contains the LFS tracking rule:

```
*.sf2 filter=lfs diff=lfs merge=lfs -text
```

No additional configuration is needed — LFS is pre-configured.

> **GitHub Free accounts** include 1 GB of LFS storage and 100 GB of monthly bandwidth. For larger collections, consider [GitHub Pro](https://github.com/pricing) or self-hosted storage.

---

### 3. Add Your SoundFonts

Copy your `.sf2` files into the `soundfonts/` directory and push:

```bash
cp /path/to/MyFont.sf2 soundfonts/
git add soundfonts/MyFont.sf2
git commit -m "Add MyFont soundfont"
git push origin main
```

Git LFS will handle the binary upload automatically.

---

### 4. Enable GitHub Actions

GitHub **disables Actions by default on forked repositories**. You must re-enable them manually.

1. Go to your forked repository on GitHub.
2. Click the **Actions** tab.
3. Click **"I understand my workflows, go ahead and enable them"**.

The workflow will now trigger on every push to `main`.

---

### 5. Enable GitHub Pages

1. Go to **Settings** → **Pages** (in your forked repo).
2. Under **Source**, select **GitHub Actions**.
3. Save.

> Make sure the source is set to **GitHub Actions**, not `Deploy from a branch`. The workflow uses the `actions/deploy-pages` action and requires this mode.

Once configured, the next successful workflow run will publish your fonts. The Pages URL is displayed in **Settings → Pages** after first deployment.

---

## Accessing Your Deployed Fonts

After a successful deployment, your converted fonts are available at:

```
https://<your-username>.github.io/<your-repo>/
```


---

## CI/CD Pipeline Details

The workflow defined in `.github/workflows/pages.yml` runs the following steps on every push to `main`:

| Step | Description |
|------|-------------|
| `actions/checkout` | Checks out the repo with LFS support enabled (`lfs: true`) |
| `actions/setup-node` | Sets up the Node.js runtime |
| `npm install` | Installs conversion dependencies |
| `npm run convert` | Runs `scripts/convert.js` — iterates over `soundfonts/*.sf2` and outputs JSON/JS to `dist/sound/` |
| `npm run catalog` | Runs `scripts/catalog.js` — create a `catalog.json` index file |
| `actions/upload-pages-artifact` | Packages the `dist/` directory as a Pages artifact |
| `actions/deploy-pages` | Deploys the artifact to GitHub Pages |

The workflow requires two permissions set in `pages.yml`:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

These are already configured — no manual changes needed.

---


## Local Development

To run the conversion pipeline locally:

```bash
# Prerequisites: Node.js >= 18, Git LFS

git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install

# Place .sf2 files in soundfonts/ then:
npm run convert
npm run catalog

# Output is written to dist/
```

---

## Troubleshooting

**Actions tab is missing or greyed out**
Actions are disabled on forks. Go to **Settings → Actions → General** and set the policy to *Allow all actions*.

**LFS quota exceeded**
GitHub Free includes 1 GB LFS storage. You can purchase additional data packs in **Settings → Billing**, or reduce file size by converting `.sf2` files to a lighter preset subset before adding them.

**Pages shows a 404 after first deployment**
It can take 1–2 minutes for GitHub Pages DNS to propagate after the initial deploy. Check the deployment status under **Actions → the latest workflow run → deploy job**.

**Workflow fails at the conversion step**
Ensure your `.sf2` files are valid SoundFont 2 files. Corrupt or SoundFont 3 (`.sf3`) files are not supported. Run `npm run convert` locally to inspect errors before pushing.

**Fonts not updating after push**
Verify that LFS pointers were committed correctly with `git lfs ls-files`. If raw pointer text files appear instead of binary blobs, re-run `git lfs install` and re-add the files.

---

## License

MIT © [WebAudioFonts](https://github.com/WebAudioFonts)
