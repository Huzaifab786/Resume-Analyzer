import React from "react";
import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { TailoredResume } from "@/agent/types";
import {
  educationDateLabel,
  formatDateRange,
  getContactParts,
  groupSkillsByCategory,
  SECTION_HEADINGS,
} from "@/agent/resume-templates/shared";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 42,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
    color: "#111111",
  },
  header: {
    alignItems: "center",
    marginBottom: 14,
  },
  name: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
  },
  headline: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
    textAlign: "center",
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 6,
  },
  contactText: {
    fontSize: 9,
    color: "#111111",
  },
  contactLink: {
    fontSize: 9,
    color: "#0563C1",
    textDecoration: "underline",
  },
  contactSep: {
    fontSize: 9,
    color: "#111111",
  },
  section: {
    marginTop: 10,
  },
  heading: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  headingRule: {
    borderBottomWidth: 1,
    borderBottomColor: "#111111",
    marginBottom: 6,
  },
  body: {
    fontSize: 10,
    textAlign: "justify",
  },
  skillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 2,
  },
  skillCategory: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  skillItems: {
    fontSize: 10,
  },
  entry: {
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  entryTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    flex: 1,
    paddingRight: 8,
  },
  entryDates: {
    fontSize: 9,
    fontFamily: "Helvetica-Oblique",
    color: "#111111",
  },
  metaLine: {
    fontSize: 9,
    fontFamily: "Helvetica-Oblique",
    marginTop: 2,
    marginBottom: 2,
  },
  bullet: {
    marginLeft: 10,
    marginBottom: 2,
    fontSize: 9.5,
  },
  educationMeta: {
    fontSize: 9.5,
    marginTop: 2,
  },
});

function SectionHeading({ title }: { title: string }) {
  return (
    <View>
      <Text style={styles.heading}>{title}</Text>
      <View style={styles.headingRule} />
    </View>
  );
}

function ContactLine({ resume }: { resume: TailoredResume }) {
  const parts = getContactParts(resume);

  if (parts.length === 0) {
    return null;
  }

  return (
    <View style={styles.contactRow}>
      {parts.map((part, index) => (
        <View
          key={`${part.text}-${index}`}
          style={{ flexDirection: "row" }}
        >
          {index > 0 ? <Text style={styles.contactSep}> | </Text> : null}
          {part.href ? (
            <Link src={part.href}>
              <Text style={styles.contactLink}>{part.text}</Text>
            </Link>
          ) : (
            <Text style={styles.contactText}>{part.text}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

export function ClassicResumeDocument({ resume }: { resume: TailoredResume }) {
  const skillGroups = groupSkillsByCategory(resume);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{resume.fullName}</Text>
          {resume.headline ? (
            <Text style={styles.headline}>{resume.headline}</Text>
          ) : null}
          <ContactLine resume={resume} />
        </View>

        <View style={styles.section}>
          <SectionHeading title={SECTION_HEADINGS.summary} />
          <Text style={styles.body}>{resume.summary}</Text>
        </View>

        {skillGroups.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title={SECTION_HEADINGS.skills} />
            {skillGroups.map((group, groupIndex) => (
              <View
                key={`skill-group-${groupIndex}`}
                style={styles.skillRow}
              >
                <Text style={styles.skillCategory}>{group.category}: </Text>
                <Text style={styles.skillItems}>{group.skills.join(", ")}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {resume.experience.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title={SECTION_HEADINGS.experience} />
            {resume.experience.map((job, jobIndex) => (
              <View
                key={`job-${jobIndex}`}
                style={styles.entry}
                wrap={false}
              >
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {job.title} — {job.company}
                    {job.location ? ` (${job.location})` : ""}
                  </Text>
                  <Text style={styles.entryDates}>
                    {formatDateRange(job.startDate, job.endDate)}
                  </Text>
                </View>
                {job.companyDescription ? (
                  <Text style={styles.metaLine}>
                    Tech Stack: {job.companyDescription}
                  </Text>
                ) : null}
                {job.bullets.map((bullet, bulletIndex) => (
                  <Text
                    key={`job-${jobIndex}-bullet-${bulletIndex}`}
                    style={styles.bullet}
                  >
                    • {bullet}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {resume.projects.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title={SECTION_HEADINGS.projects} />
            {resume.projects.map((project, projectIndex) => (
              <View
                key={`project-${projectIndex}`}
                style={styles.entry}
                wrap={false}
              >
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {project.name}
                    {project.subtitle ? ` — ${project.subtitle}` : ""}
                  </Text>
                  {project.startDate ? (
                    <Text style={styles.entryDates}>
                      {formatDateRange(project.startDate, project.endDate)}
                    </Text>
                  ) : null}
                </View>
                {project.technologies ? (
                  <Text style={styles.metaLine}>{project.technologies}</Text>
                ) : null}
                {project.bullets.map((bullet, bulletIndex) => (
                  <Text
                    key={`project-${projectIndex}-bullet-${bulletIndex}`}
                    style={styles.bullet}
                  >
                    • {bullet}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {resume.education.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title={SECTION_HEADINGS.education} />
            {resume.education.map((school, schoolIndex) => (
              <View
                key={`school-${schoolIndex}`}
                style={styles.entry}
                wrap={false}
              >
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {school.degree} — {school.institution}
                    {school.location ? `, ${school.location}` : ""}
                  </Text>
                  <Text style={styles.entryDates}>
                    {educationDateLabel(school)}
                  </Text>
                </View>
                {school.details ? (
                  <Text style={styles.educationMeta}>{school.details}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
