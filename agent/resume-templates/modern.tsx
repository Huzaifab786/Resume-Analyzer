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

const NAVY = "#1a365d";
const BODY = "#2d3748";
const RULE = "#cbd5e0";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 42,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
    color: BODY,
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: NAVY,
    textAlign: "center",
  },
  headline: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: NAVY,
    marginTop: 4,
    textAlign: "center",
  },
  doubleRule: {
    marginTop: 10,
    marginBottom: 8,
    width: "100%",
  },
  thickRule: {
    borderBottomWidth: 2.5,
    borderBottomColor: NAVY,
    marginBottom: 2,
  },
  thinRule: {
    borderBottomWidth: 1,
    borderBottomColor: NAVY,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  contactText: {
    fontSize: 9,
    color: BODY,
  },
  contactSep: {
    fontSize: 9,
    color: BODY,
  },
  section: {
    marginTop: 12,
  },
  headingRow: {
    marginBottom: 6,
  },
  heading: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: NAVY,
    marginBottom: 3,
  },
  headingRule: {
    borderBottomWidth: 1,
    borderBottomColor: RULE,
  },
  body: {
    fontSize: 10,
    color: BODY,
    textAlign: "justify",
  },
  entry: {
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  entryTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: NAVY,
    flex: 1,
    paddingRight: 8,
  },
  entryMeta: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: NAVY,
    textAlign: "right",
    maxWidth: "42%",
  },
  bullet: {
    marginLeft: 10,
    marginBottom: 2,
    fontSize: 9.5,
    color: BODY,
  },
  institution: {
    fontSize: 10,
    color: BODY,
    marginBottom: 2,
  },
  skillGroup: {
    marginBottom: 4,
  },
  skillCategory: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: NAVY,
    marginBottom: 1,
  },
  skillItems: {
    fontSize: 10,
    color: BODY,
  },
  metaLine: {
    fontSize: 9,
    color: BODY,
    marginBottom: 2,
  },
});

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={styles.headingRow}>
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
        <View key={`${part.text}-${index}`} style={{ flexDirection: "row" }}>
          {index > 0 ? <Text style={styles.contactSep}> | </Text> : null}
          {part.href ? (
            <Link src={part.href}>
              <Text style={styles.contactText}>{part.text}</Text>
            </Link>
          ) : (
            <Text style={styles.contactText}>{part.text}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

export function ModernResumeDocument({ resume }: { resume: TailoredResume }) {
  const skillGroups = groupSkillsByCategory(resume);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{resume.fullName}</Text>
          {resume.headline ? (
            <Text style={styles.headline}>{resume.headline}</Text>
          ) : null}
          <View style={styles.doubleRule}>
            <View style={styles.thickRule} />
            <View style={styles.thinRule} />
          </View>
          <ContactLine resume={resume} />
        </View>

        <View style={styles.section}>
          <SectionHeading title={SECTION_HEADINGS.summary} />
          <Text style={styles.body}>{resume.summary}</Text>
        </View>

        {resume.experience.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title={SECTION_HEADINGS.experience} />
            {resume.experience.map((job, jobIndex) => (
              <View key={`job-${jobIndex}`} style={styles.entry} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{job.title}</Text>
                  <Text style={styles.entryMeta}>
                    {job.company}
                    {job.location ? ` | ${job.location}` : ""}
                    {" | "}
                    {formatDateRange(job.startDate, job.endDate)}
                  </Text>
                </View>
                {job.companyDescription ? (
                  <Text style={styles.metaLine}>{job.companyDescription}</Text>
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
                  <Text style={styles.entryTitle}>{project.name}</Text>
                  {project.subtitle || project.startDate ? (
                    <Text style={styles.entryMeta}>
                      {[
                        project.subtitle,
                        project.startDate
                          ? formatDateRange(project.startDate, project.endDate)
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" | ")}
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
                <Text style={styles.entryTitle}>{school.degree}</Text>
                <Text style={styles.institution}>
                  {[
                    school.institution,
                    school.location,
                    educationDateLabel(school),
                  ]
                    .filter(Boolean)
                    .join(" | ")}
                </Text>
                {school.details ? (
                  <Text style={styles.bullet}>• {school.details}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {skillGroups.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title={SECTION_HEADINGS.skills} />
            {skillGroups.map((group, groupIndex) => (
              <View key={`skill-group-${groupIndex}`} style={styles.skillGroup}>
                <Text style={styles.skillCategory}>{group.category}</Text>
                <Text style={styles.skillItems}>{group.skills.join(", ")}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
