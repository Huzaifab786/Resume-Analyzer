# Resume Templates — Product Spec

Professional, company-acceptable templates for Feature 14.  
**Runtime code:** `agent/resume-templates/`  
**Your reference downloads:** `context/designs/resume-templates/`

---

## Important: how templates work in this app

This project generates PDFs with **@react-pdf/renderer** (React → PDF). That means:

| Approach | Works? | Notes |
| -------- | ------ | ----- |
| Download Word/Google PDF and drop in repo | **Reference only** | We match the *layout*, not embed the file |
| Download random Canva template | **Not recommended** | Often ATS-unfriendly; licensing unclear |
| Code templates in `agent/resume-templates/` | **Yes — this is what we ship** | Full control, ATS-safe, same data for all layouts |

You **do not** need to find perfect fill-in PDF forms. Download 1–3 **examples you like** from Harvard / Google / Microsoft, put them in `context/designs/resume-templates/`, and we build matching layouts in code.

---

## Launch templates (3)

### 1. `classic` — Chronological (default)

**Best for:** Most industries, finance, consulting, government, traditional companies  
**Based on:** Harvard chronological / European CV style (like your uploaded resume)

| Trait | Value |
| ----- | ----- |
| Font | Times-Roman (serif) |
| Header | Centered — name, title, contact line |
| Experience | Dates in left column, role + bullets on right |
| Sections | Links, Profile, Employment History, Education, Skills |
| ATS | Excellent — plain text structure |

**Reference file:** `context/designs/resume-templates/classic-reference.pdf`

---

### 2. `modern` — Professional single-column

**Best for:** Tech, startups, product, marketing, most US corporate roles  
**Based on:** Google “Swiss” / Microsoft “Basic” style resumes

| Trait | Value |
| ----- | ----- |
| Font | Helvetica (sans-serif) |
| Header | Left-aligned name + contact |
| Experience | Title and dates on one line, company below, bullets |
| Sections | Summary, Skills, Experience, Education |
| ATS | Excellent — most common US format |

**Reference file:** `context/designs/resume-templates/modern-reference.pdf`

---

### 3. `minimal` — Harvard simple

**Best for:** Students, career changers, academic-adjacent roles, when brevity matters  
**Based on:** Harvard “simple” one-page samples

| Trait | Value |
| ----- | ----- |
| Font | Helvetica |
| Header | Name large, single contact line |
| Experience | Compact blocks, minimal rules |
| Sections | Education first optional — Summary, Experience, Education, Skills |
| ATS | Excellent — maximum readability |

**Reference file:** `context/designs/resume-templates/minimal-reference.pdf`

---

## Templates we will NOT offer (and why)

| Style | Why excluded |
| ----- | ------------ |
| Two-column with sidebar (skills left, experience right) | ATS parsers often read columns out of order |
| Infographic / icon / progress-bar skills | Not machine-readable |
| Photo resume | Discouraged in US/UK hiring; compliance issues |
| Creative / designer portfolio layout | Wrong product audience for MVP |
| Copy of user’s uploaded PDF pixel-perfect | Technically infeasible from text extraction alone |

---

## Folder map

```
context/designs/resume-templates/   ← YOU: reference PDFs/PNGs (not in git if large — optional)
context/resume-templates.md         ← THIS FILE: spec + ATS rules
agent/resume-templates/             ← WE BUILD: classic.tsx, modern.tsx, minimal.tsx, index.ts
agent/resume-pdf.tsx                ← Entry: renderTailoredResumePdf(resume, templateId)
```

---

## Status

Feature 14 implemented. References used:

| File | Maps to |
| ---- | ------- |
| `CV_Template_One.pdf` | `modern` |
| `CV_Template_Two.pdf` | `minimal` |
| (built-in Times layout) | `classic` |

Runtime code: `agent/resume-templates/{classic,modern,minimal}.tsx` + `index.tsx`.

---

## Picker UI previews

Thumbnail images for `/analyze/[id]` template picker can come from:

1. Static PNGs in `public/resume-templates/` (exported from our own render once built), or  
2. Reference PNGs from `context/designs/resume-templates/*-preview.png` until real previews exist

Do not use copyrighted template vendor thumbnails in production.
