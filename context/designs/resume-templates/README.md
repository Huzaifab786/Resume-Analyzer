# Resume template references (you add files here)

These files are **visual references only** — not loaded by the app at runtime.

## What to download

Download **PDF or PNG examples** of professional, ATS-friendly resumes from trusted sources, for example:

| Source | What to get | Why |
| ------ | ----------- | --- |
| [Harvard Mignone Center — resumes & CVs](https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/) | Chronological / academic PDF samples | Gold standard for US corporate & grad hiring |
| [Google Docs template gallery](https://docs.google.com/document/u/0/?ftv=1&tgif=d) → Resumes | “Serif”, “Swiss”, “Modern writer” | Clean, widely accepted layouts — export as PDF |
| [Microsoft Create — resume templates](https://create.microsoft.com/en-us/templates/resumes) | Simple professional / basic chronological | Corporate-safe, minimal graphics |

**Do not** use flashy Canva designs with columns, icons, photos, or colored sidebars — many ATS systems parse them poorly.

## Reference files in this folder

```
context/designs/resume-templates/
  CV_Template_One.pdf    → Modern (US tech, single-column)
  CV_Template_Two.pdf    → Minimal (open spacing, simple headings)
  CV_Template_Three.pdf  → Modern/Minimal polish reference
```

Classic uses the built-in Times / date-column layout (no extra reference required).

Optional PNG screenshots (first page only) help the picker UI:

```
  classic-preview.png
  modern-preview.png
  minimal-preview.png
```

## What we do with these

1. You drop reference PDFs/PNGs in **this folder**.
2. We read them when coding Feature 14.
3. We implement **original layouts in code** at `agent/resume-templates/` using `@react-pdf/renderer`.
4. We do **not** ship third-party PDF files inside the product (licensing + ATS control).

## ATS-safe checklist (all templates must pass)

- [ ] Single or simple two-column text only (no text inside images)
- [ ] Standard fonts: Times, Helvetica, or equivalent built-in PDF fonts
- [ ] No profile photo, icons, or skill bar charts
- [ ] Clear section headings: Profile, Experience, Education, Skills
- [ ] Black/dark gray text on white background
- [ ] Bullet lists for experience — not tables for job history

See `context/resume-templates.md` for the full template spec.
