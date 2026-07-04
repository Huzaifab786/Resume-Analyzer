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
  formatSkillLabel,
  getContactParts,
  SECTION_HEADINGS,
} from "@/agent/resume-templates/shared";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
    color: "#1f1f1f",
  },
  header: {
    alignItems: "center",
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    textAlign: "center",
  },
  headline: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
    textAlign: "center",
  },
  headerRule: {
    marginTop: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d4",
    width: "100%",
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  contactText: {
    fontSize: 9,
    color: "#333333",
  },
  contactSep: {
    fontSize: 9,
    color: "#333333",
  },
  section: {
    marginTop: 12,
  },
  headingBar: {
    backgroundColor: "#e8e8e8",
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  heading: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  body: {
    fontSize: 10,
    textAlign: "justify",
  },
  entry: {
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  entryTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    flex: 1,
    paddingRight: 8,
  },
  entryDates: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  institution: {
    fontSize: 10,
    marginBottom: 2,
  },
  bullet: {
    marginLeft: 10,
    marginBottom: 2,
    fontSize: 9.5,
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillItem: {
    width: "33.33%",
    flexDirection: "row",
    paddingRight: 8,
    marginBottom: 4,
  },
  skillBullet: {
    fontSize: 9.5,
    marginRight: 4,
  },
  skillText: {
    fontSize: 9.5,
    flex: 1,
  },
  metaLine: {
    fontSize: 9,
    marginBottom: 2,
    color: "#333333",
  },
});

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={styles.headingBar}>
      <Text style={styles.heading}>{title}</Text>
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

export function MinimalResumeDocument({ resume }: { resume: TailoredResume }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{resume.fullName}</Text>
          {resume.headline ? (
            <Text style={styles.headline}>{resume.headline}</Text>
          ) : null}
          <View style={styles.headerRule} />
          <ContactLine resume={resume} />
        </View>

        <View style={styles.section}>
          <SectionHeading title={SECTION_HEADINGS.summary} />
          <Text style={styles.body}>{resume.summary}</Text>
        </View>

        {resume.skills.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title={SECTION_HEADINGS.skills} />
            <View style={styles.skillsGrid}>
              {resume.skills.map((skill, skillIndex) => (
                <View key={`skill-${skillIndex}`} style={styles.skillItem}>
                  <Text style={styles.skillBullet}>•</Text>
                  <Text style={styles.skillText}>{formatSkillLabel(skill)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {resume.experience.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title={SECTION_HEADINGS.experience} />
            {resume.experience.map((job, jobIndex) => (
              <View key={`job-${jobIndex}`} style={styles.entry} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {job.title}, {job.company}
                  </Text>
                  <Text style={styles.entryDates}>
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
                  <Text style={styles.entryTitle}>
                    {project.name}
                    {project.subtitle ? `, ${project.subtitle}` : ""}
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
                  <Text style={styles.entryTitle}>{school.degree}</Text>
                  <Text style={styles.entryDates}>
                    {educationDateLabel(school)}
                  </Text>
                </View>
                <Text style={styles.institution}>
                  {school.institution}
                  {school.location ? `, ${school.location}` : ""}
                </Text>
                {school.details ? (
                  <Text style={styles.bullet}>• {school.details}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
