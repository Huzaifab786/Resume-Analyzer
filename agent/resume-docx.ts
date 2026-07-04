import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Packer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
  type IBorderOptions,
} from "docx";

import type { TailoredResume } from "@/agent/types";
import {
  DEFAULT_RESUME_TEMPLATE_ID,
  type ResumeTemplateId,
} from "@/agent/resume-templates";
import {
  educationDateLabel,
  formatDateRange,
  formatSkillLabel,
  getContactParts,
  groupSkillsByCategory,
  SECTION_HEADINGS,
} from "@/agent/resume-templates/shared";

type TemplateStyle = {
  accent: string;
  body: string;
  headingBarFill?: string;
  useDoubleHeaderRule: boolean;
  useHeadingBar: boolean;
  skillsAsColumns: boolean;
  skillsCategorized: boolean;
  experienceLayout: "classic" | "modern" | "minimal";
};

const STYLES: Record<ResumeTemplateId, TemplateStyle> = {
  classic: {
    accent: "111111",
    body: "111111",
    useDoubleHeaderRule: false,
    useHeadingBar: false,
    skillsAsColumns: false,
    skillsCategorized: true,
    experienceLayout: "classic",
  },
  minimal: {
    accent: "1f1f1f",
    body: "1f1f1f",
    headingBarFill: "E8E8E8",
    useDoubleHeaderRule: false,
    useHeadingBar: true,
    skillsAsColumns: true,
    skillsCategorized: false,
    experienceLayout: "minimal",
  },
  modern: {
    accent: "1A365D",
    body: "2D3748",
    useDoubleHeaderRule: true,
    useHeadingBar: false,
    skillsAsColumns: false,
    skillsCategorized: true,
    experienceLayout: "modern",
  },
};

function bottomBorder(color: string, size = 8): IBorderOptions {
  return {
    style: BorderStyle.SINGLE,
    size,
    color,
  };
}

function textRun(
  text: string,
  options: {
    bold?: boolean;
    italics?: boolean;
    size?: number;
    color?: string;
    allCaps?: boolean;
  } = {},
): TextRun {
  return new TextRun({
    text: options.allCaps ? text.toUpperCase() : text,
    bold: options.bold,
    italics: options.italics,
    size: options.size ?? 20,
    color: options.color,
    font: "Calibri",
  });
}

function emptyParagraph(): Paragraph {
  return new Paragraph({ children: [] });
}

function bulletParagraph(text: string, color: string): Paragraph {
  return new Paragraph({
    children: [textRun(`• ${text}`, { size: 19, color })],
    spacing: { after: 60 },
    indent: { left: 200 },
  });
}

function sectionHeading(
  title: string,
  style: TemplateStyle,
): Paragraph[] {
  if (style.useHeadingBar) {
    return [
      new Paragraph({
        shading: { fill: style.headingBarFill ?? "E8E8E8" },
        spacing: { before: 200, after: 120 },
        children: [
          textRun(title, {
            bold: true,
            allCaps: true,
            size: 20,
            color: style.accent,
          }),
        ],
      }),
    ];
  }

  return [
    new Paragraph({
      spacing: { before: 200, after: 60 },
      border: {
        bottom: bottomBorder(style.accent === "1A365D" ? "CBD5E0" : style.accent),
      },
      children: [
        textRun(title, {
          bold: true,
          allCaps: true,
          size: 22,
          color: style.accent,
        }),
      ],
    }),
  ];
}

function contactParagraph(
  resume: TailoredResume,
  style: TemplateStyle,
): Paragraph {
  const parts = getContactParts(resume);
  const children: (TextRun | ExternalHyperlink)[] = [];

  parts.forEach((part, index) => {
    if (index > 0) {
      children.push(textRun(" | ", { size: 18, color: style.body }));
    }

    if (part.href && !part.href.startsWith("mailto:")) {
      children.push(
        new ExternalHyperlink({
          children: [
            textRun(part.text, {
              size: 18,
              color: style.experienceLayout === "classic" ? "0563C1" : style.body,
            }),
          ],
          link: part.href,
        }),
      );
    } else {
      children.push(textRun(part.text, { size: 18, color: style.body }));
    }
  });

  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children,
  });
}

function headerParagraphs(
  resume: TailoredResume,
  style: TemplateStyle,
): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        textRun(resume.fullName, {
          bold: true,
          allCaps: true,
          size: 36,
          color: style.accent,
        }),
      ],
    }),
  ];

  if (resume.headline) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          textRun(resume.headline, {
            bold: true,
            allCaps: style.experienceLayout === "modern",
            size: 22,
            color: style.accent,
          }),
        ],
      }),
    );
  }

  if (style.useDoubleHeaderRule) {
    paragraphs.push(
      new Paragraph({
        border: { bottom: bottomBorder(style.accent, 18) },
        spacing: { after: 40 },
        children: [],
      }),
      new Paragraph({
        border: { bottom: bottomBorder(style.accent, 6) },
        spacing: { after: 100 },
        children: [],
      }),
    );
  } else if (style.experienceLayout === "minimal") {
    paragraphs.push(
      new Paragraph({
        border: { bottom: bottomBorder("D4D4D4", 6) },
        spacing: { after: 100 },
        children: [],
      }),
    );
  }

  paragraphs.push(contactParagraph(resume, style));
  return paragraphs;
}

function entryHeaderParagraph(
  left: string,
  right: string,
  style: TemplateStyle,
  options: { leftColor?: string; rightItalics?: boolean } = {},
): Paragraph {
  return new Paragraph({
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: TabStopPosition.MAX,
      },
    ],
    spacing: { before: 80, after: 40 },
    children: [
      textRun(left, {
        bold: true,
        size: 20,
        color: options.leftColor ?? style.accent,
      }),
      textRun("\t"),
      textRun(right, {
        bold: !options.rightItalics,
        italics: options.rightItalics,
        size: 18,
        color: options.leftColor ?? style.accent,
      }),
    ],
  });
}

function buildChildren(
  resume: TailoredResume,
  style: TemplateStyle,
): Paragraph[] {
  const children: Paragraph[] = [...headerParagraphs(resume, style)];

  children.push(...sectionHeading(SECTION_HEADINGS.summary, style));
  children.push(
    new Paragraph({
      spacing: { after: 120 },
      children: [textRun(resume.summary, { size: 20, color: style.body })],
    }),
  );

  const skillGroups = groupSkillsByCategory(resume);

  if (style.experienceLayout === "classic" && skillGroups.length > 0) {
    children.push(...sectionHeading(SECTION_HEADINGS.skills, style));
    for (const group of skillGroups) {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            textRun(`${group.category}: `, {
              bold: true,
              size: 20,
              color: style.body,
            }),
            textRun(group.skills.join(", "), { size: 20, color: style.body }),
          ],
        }),
      );
    }
  }

  if (style.experienceLayout === "minimal" && resume.skills.length > 0) {
    children.push(...sectionHeading(SECTION_HEADINGS.skills, style));
    for (const skill of resume.skills) {
      children.push(bulletParagraph(formatSkillLabel(skill), style.body));
    }
  }

  if (resume.experience.length > 0) {
    children.push(...sectionHeading(SECTION_HEADINGS.experience, style));

    for (const job of resume.experience) {
      if (style.experienceLayout === "classic") {
        children.push(
          entryHeaderParagraph(
            `${job.title} — ${job.company}${job.location ? ` (${job.location})` : ""}`,
            formatDateRange(job.startDate, job.endDate),
            style,
            { rightItalics: true },
          ),
        );
        if (job.companyDescription) {
          children.push(
            new Paragraph({
              spacing: { after: 40 },
              children: [
                textRun(`Tech Stack: ${job.companyDescription}`, {
                  italics: true,
                  size: 18,
                  color: style.body,
                }),
              ],
            }),
          );
        }
      } else if (style.experienceLayout === "modern") {
        children.push(
          entryHeaderParagraph(
            job.title,
            `${job.company}${job.location ? ` | ${job.location}` : ""} | ${formatDateRange(job.startDate, job.endDate)}`,
            style,
          ),
        );
        if (job.companyDescription) {
          children.push(
            new Paragraph({
              spacing: { after: 40 },
              children: [
                textRun(job.companyDescription, { size: 18, color: style.body }),
              ],
            }),
          );
        }
      } else {
        children.push(
          entryHeaderParagraph(
            `${job.title}, ${job.company}`,
            formatDateRange(job.startDate, job.endDate),
            style,
          ),
        );
        if (job.companyDescription) {
          children.push(
            new Paragraph({
              spacing: { after: 40 },
              children: [
                textRun(job.companyDescription, { size: 18, color: style.body }),
              ],
            }),
          );
        }
      }

      for (const bullet of job.bullets) {
        children.push(bulletParagraph(bullet, style.body));
      }
    }
  }

  if (resume.projects.length > 0) {
    children.push(...sectionHeading(SECTION_HEADINGS.projects, style));

    for (const project of resume.projects) {
      const title =
        style.experienceLayout === "classic"
          ? `${project.name}${project.subtitle ? ` — ${project.subtitle}` : ""}`
          : project.name;
      const right =
        style.experienceLayout === "modern"
          ? [project.subtitle, project.startDate
              ? formatDateRange(project.startDate, project.endDate)
              : null]
              .filter(Boolean)
              .join(" | ")
          : project.startDate
            ? formatDateRange(project.startDate, project.endDate)
            : "";

      children.push(
        entryHeaderParagraph(title, right, style, {
          rightItalics: style.experienceLayout === "classic",
        }),
      );

      if (project.technologies) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              textRun(project.technologies, {
                italics: style.experienceLayout === "classic",
                size: 18,
                color: style.body,
              }),
            ],
          }),
        );
      }

      for (const bullet of project.bullets) {
        children.push(bulletParagraph(bullet, style.body));
      }
    }
  }

  if (resume.education.length > 0) {
    children.push(...sectionHeading(SECTION_HEADINGS.education, style));

    for (const school of resume.education) {
      if (style.experienceLayout === "classic") {
        children.push(
          entryHeaderParagraph(
            `${school.degree} — ${school.institution}${school.location ? `, ${school.location}` : ""}`,
            educationDateLabel(school),
            style,
            { rightItalics: true },
          ),
        );
      } else if (style.experienceLayout === "modern") {
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 20 },
            children: [
              textRun(school.degree, {
                bold: true,
                size: 20,
                color: style.accent,
              }),
            ],
          }),
        );
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              textRun(
                [school.institution, school.location, educationDateLabel(school)]
                  .filter(Boolean)
                  .join(" | "),
                { size: 20, color: style.body },
              ),
            ],
          }),
        );
      } else {
        children.push(
          entryHeaderParagraph(
            school.degree,
            educationDateLabel(school),
            style,
          ),
        );
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              textRun(
                `${school.institution}${school.location ? `, ${school.location}` : ""}`,
                { size: 20, color: style.body },
              ),
            ],
          }),
        );
      }

      if (school.details) {
        children.push(
          style.experienceLayout === "classic"
            ? new Paragraph({
                spacing: { after: 40 },
                children: [
                  textRun(school.details, { size: 19, color: style.body }),
                ],
              })
            : bulletParagraph(school.details, style.body),
        );
      }
    }
  }

  if (
    style.experienceLayout === "modern" &&
    style.skillsCategorized &&
    skillGroups.length > 0
  ) {
    children.push(...sectionHeading(SECTION_HEADINGS.skills, style));
    for (const group of skillGroups) {
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 20 },
          children: [
            textRun(group.category, {
              bold: true,
              size: 20,
              color: style.accent,
            }),
          ],
        }),
      );
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            textRun(group.skills.join(", "), { size: 20, color: style.body }),
          ],
        }),
      );
    }
  }

  return children;
}

export async function renderTailoredResumeDocx(
  resume: TailoredResume,
  templateId: ResumeTemplateId = DEFAULT_RESUME_TEMPLATE_ID,
): Promise<Buffer> {
  const style = STYLES[templateId] ?? STYLES.classic;
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children: buildChildren(resume, style),
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export function getTailoredStoragePaths(
  userId: string,
  analysisId: string,
): { pdf: string; docx: string } {
  return {
    pdf: `${userId}/tailored/${analysisId}.pdf`,
    docx: `${userId}/tailored/${analysisId}.docx`,
  };
}
