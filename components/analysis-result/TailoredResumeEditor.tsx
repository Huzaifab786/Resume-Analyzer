"use client";

import { Plus, Trash2 } from "lucide-react";

import type { TailoredResume } from "@/agent/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TailoredResumeEditorProps = {
  value: TailoredResume;
  onChange: (value: TailoredResume) => void;
  disabled?: boolean;
  fieldErrors?: string[];
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-text-secondary">{label}</Label>
      {children}
    </div>
  );
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface-secondary/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function createEmptyTailoredResume(): TailoredResume {
  return {
    fullName: "",
    summary: "",
    skills: [],
    experience: [],
    projects: [],
    education: [],
    changesApplied: [],
  };
}

export function TailoredResumeEditor({
  value,
  onChange,
  disabled = false,
  fieldErrors = [],
}: TailoredResumeEditorProps) {
  const update = (patch: Partial<TailoredResume>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <div className="space-y-4">
      {fieldErrors.length > 0 ? (
        <div className="rounded-lg border border-warning bg-warning-light px-4 py-3 text-sm text-text-primary">
          <ul className="list-disc space-y-1 pl-4">
            {fieldErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <Section title="Header">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name *">
            <Input
              value={value.fullName}
              disabled={disabled}
              onChange={(event) => update({ fullName: event.target.value })}
            />
          </Field>
          <Field label="Headline">
            <Input
              value={value.headline ?? ""}
              disabled={disabled}
              placeholder="e.g. Frontend Developer"
              onChange={(event) =>
                update({ headline: event.target.value || undefined })
              }
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={value.email ?? ""}
              disabled={disabled}
              onChange={(event) =>
                update({ email: event.target.value || undefined })
              }
            />
          </Field>
          <Field label="Phone">
            <Input
              value={value.phone ?? ""}
              disabled={disabled}
              onChange={(event) =>
                update({ phone: event.target.value || undefined })
              }
            />
          </Field>
          <Field label="Address">
            <Input
              value={value.address ?? ""}
              disabled={disabled}
              onChange={(event) =>
                update({ address: event.target.value || undefined })
              }
            />
          </Field>
          <Field label="Location">
            <Input
              value={value.location ?? ""}
              disabled={disabled}
              onChange={(event) =>
                update({ location: event.target.value || undefined })
              }
            />
          </Field>
        </div>
      </Section>

      <Section title="Profile">
        <Field label="Summary *">
          <Textarea
            value={value.summary}
            disabled={disabled}
            rows={4}
            onChange={(event) => update({ summary: event.target.value })}
          />
        </Field>
      </Section>

      <Section
        title="Personal details"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className="gap-1"
            onClick={() =>
              update({
                personalDetails: [
                  ...(value.personalDetails ?? []),
                  { label: "", value: "" },
                ],
              })
            }
          >
            <Plus className="size-3.5" />
            Add
          </Button>
        }
      >
        {(value.personalDetails ?? []).length === 0 ? (
          <p className="text-xs text-text-muted">Optional key-value details.</p>
        ) : (
          <div className="space-y-2">
            {(value.personalDetails ?? []).map((detail, index) => (
              <div key={`detail-${index}`} className="flex gap-2">
                <Input
                  placeholder="Label"
                  value={detail.label}
                  disabled={disabled}
                  onChange={(event) => {
                    const personalDetails = [...(value.personalDetails ?? [])];
                    personalDetails[index] = {
                      ...detail,
                      label: event.target.value,
                    };
                    update({ personalDetails });
                  }}
                />
                <Input
                  placeholder="Value"
                  value={detail.value}
                  disabled={disabled}
                  onChange={(event) => {
                    const personalDetails = [...(value.personalDetails ?? [])];
                    personalDetails[index] = {
                      ...detail,
                      value: event.target.value,
                    };
                    update({ personalDetails });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  onClick={() => {
                    const personalDetails = (value.personalDetails ?? []).filter(
                      (_, i) => i !== index,
                    );
                    update({
                      personalDetails:
                        personalDetails.length > 0 ? personalDetails : undefined,
                    });
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Links"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className="gap-1"
            onClick={() =>
              update({
                links: [...(value.links ?? []), { label: "", url: "" }],
              })
            }
          >
            <Plus className="size-3.5" />
            Add
          </Button>
        }
      >
        {(value.links ?? []).length === 0 ? (
          <p className="text-xs text-text-muted">Optional portfolio or social links.</p>
        ) : (
          <div className="space-y-2">
            {(value.links ?? []).map((link, index) => (
              <div key={`link-${index}`} className="flex gap-2">
                <Input
                  placeholder="Label"
                  value={link.label}
                  disabled={disabled}
                  onChange={(event) => {
                    const links = [...(value.links ?? [])];
                    links[index] = { ...link, label: event.target.value };
                    update({ links });
                  }}
                />
                <Input
                  placeholder="URL"
                  value={link.url}
                  disabled={disabled}
                  onChange={(event) => {
                    const links = [...(value.links ?? [])];
                    links[index] = { ...link, url: event.target.value };
                    update({ links });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  onClick={() => {
                    const links = (value.links ?? []).filter((_, i) => i !== index);
                    update({ links: links.length > 0 ? links : undefined });
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Skills"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className="gap-1"
            onClick={() =>
              update({ skills: [...value.skills, { name: "", level: "" }] })
            }
          >
            <Plus className="size-3.5" />
            Add
          </Button>
        }
      >
        {value.skills.length === 0 ? (
          <p className="text-xs text-text-muted">Add skills shown on the resume.</p>
        ) : (
          <div className="space-y-2">
            {value.skills.map((skill, index) => (
              <div key={`skill-${index}`} className="flex gap-2">
                <Input
                  placeholder="Skill name"
                  value={skill.name}
                  disabled={disabled}
                  onChange={(event) => {
                    const skills = [...value.skills];
                    skills[index] = { ...skill, name: event.target.value };
                    update({ skills });
                  }}
                />
                <Input
                  placeholder="Category (e.g. Languages)"
                  value={skill.category ?? ""}
                  disabled={disabled}
                  onChange={(event) => {
                    const skills = [...value.skills];
                    skills[index] = {
                      ...skill,
                      category: event.target.value || undefined,
                    };
                    update({ skills });
                  }}
                />
                <Input
                  placeholder="Level (optional)"
                  value={skill.level ?? ""}
                  disabled={disabled}
                  onChange={(event) => {
                    const skills = [...value.skills];
                    skills[index] = {
                      ...skill,
                      level: event.target.value || undefined,
                    };
                    update({ skills });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  onClick={() =>
                    update({
                      skills: value.skills.filter((_, i) => i !== index),
                    })
                  }
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Experience"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className="gap-1"
            onClick={() =>
              update({
                experience: [
                  ...value.experience,
                  {
                    company: "",
                    title: "",
                    startDate: "",
                    bullets: [""],
                  },
                ],
              })
            }
          >
            <Plus className="size-3.5" />
            Add role
          </Button>
        }
      >
        {value.experience.length === 0 ? (
          <p className="text-xs text-text-muted">Add at least one role if applicable.</p>
        ) : (
          <div className="space-y-4">
            {value.experience.map((job, index) => (
              <div
                key={`job-${index}`}
                className="space-y-3 rounded-lg border border-border bg-surface p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Role {index + 1}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    className="gap-1 text-error"
                    onClick={() =>
                      update({
                        experience: value.experience.filter((_, i) => i !== index),
                      })
                    }
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Title *">
                    <Input
                      value={job.title}
                      disabled={disabled}
                      onChange={(event) => {
                        const experience = [...value.experience];
                        experience[index] = { ...job, title: event.target.value };
                        update({ experience });
                      }}
                    />
                  </Field>
                  <Field label="Company *">
                    <Input
                      value={job.company}
                      disabled={disabled}
                      onChange={(event) => {
                        const experience = [...value.experience];
                        experience[index] = {
                          ...job,
                          company: event.target.value,
                        };
                        update({ experience });
                      }}
                    />
                  </Field>
                  <Field label="Start date *">
                    <Input
                      value={job.startDate}
                      disabled={disabled}
                      placeholder="e.g. Jan 2024"
                      onChange={(event) => {
                        const experience = [...value.experience];
                        experience[index] = {
                          ...job,
                          startDate: event.target.value,
                        };
                        update({ experience });
                      }}
                    />
                  </Field>
                  <Field label="End date">
                    <Input
                      value={job.endDate ?? ""}
                      disabled={disabled}
                      placeholder="Present"
                      onChange={(event) => {
                        const experience = [...value.experience];
                        experience[index] = {
                          ...job,
                          endDate: event.target.value || undefined,
                        };
                        update({ experience });
                      }}
                    />
                  </Field>
                  <Field label="Location">
                    <Input
                      value={job.location ?? ""}
                      disabled={disabled}
                      onChange={(event) => {
                        const experience = [...value.experience];
                        experience[index] = {
                          ...job,
                          location: event.target.value || undefined,
                        };
                        update({ experience });
                      }}
                    />
                  </Field>
                  <Field label="Company description">
                    <Input
                      value={job.companyDescription ?? ""}
                      disabled={disabled}
                      onChange={(event) => {
                        const experience = [...value.experience];
                        experience[index] = {
                          ...job,
                          companyDescription: event.target.value || undefined,
                        };
                        update({ experience });
                      }}
                    />
                  </Field>
                </div>
                <Field label="Bullets">
                  <div className="space-y-2">
                    {job.bullets.map((bullet, bulletIndex) => (
                      <div key={`bullet-${index}-${bulletIndex}`} className="flex gap-2">
                        <Input
                          value={bullet}
                          disabled={disabled}
                          onChange={(event) => {
                            const experience = [...value.experience];
                            const bullets = [...job.bullets];
                            bullets[bulletIndex] = event.target.value;
                            experience[index] = { ...job, bullets };
                            update({ experience });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={disabled}
                          onClick={() => {
                            const experience = [...value.experience];
                            experience[index] = {
                              ...job,
                              bullets: job.bullets.filter(
                                (_, i) => i !== bulletIndex,
                              ),
                            };
                            update({ experience });
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled}
                      className="gap-1"
                      onClick={() => {
                        const experience = [...value.experience];
                        experience[index] = {
                          ...job,
                          bullets: [...job.bullets, ""],
                        };
                        update({ experience });
                      }}
                    >
                      <Plus className="size-3.5" />
                      Add bullet
                    </Button>
                  </div>
                </Field>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Projects"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className="gap-1"
            onClick={() =>
              update({
                projects: [
                  ...(value.projects ?? []),
                  { name: "", bullets: [""] },
                ],
              })
            }
          >
            <Plus className="size-3.5" />
            Add project
          </Button>
        }
      >
        {(value.projects ?? []).length === 0 ? (
          <p className="text-xs text-text-muted">
            Add projects from your resume if you have any.
          </p>
        ) : (
          <div className="space-y-4">
            {(value.projects ?? []).map((project, index) => (
              <div
                key={`project-${index}`}
                className="space-y-3 rounded-lg border border-border bg-surface p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Project {index + 1}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    className="gap-1 text-error"
                    onClick={() =>
                      update({
                        projects: (value.projects ?? []).filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Project name *">
                    <Input
                      value={project.name}
                      disabled={disabled}
                      onChange={(event) => {
                        const projects = [...(value.projects ?? [])];
                        projects[index] = {
                          ...project,
                          name: event.target.value,
                        };
                        update({ projects });
                      }}
                    />
                  </Field>
                  <Field label="Subtitle">
                    <Input
                      value={project.subtitle ?? ""}
                      disabled={disabled}
                      placeholder="e.g. Final Year Project"
                      onChange={(event) => {
                        const projects = [...(value.projects ?? [])];
                        projects[index] = {
                          ...project,
                          subtitle: event.target.value || undefined,
                        };
                        update({ projects });
                      }}
                    />
                  </Field>
                  <Field label="Technologies">
                    <Input
                      value={project.technologies ?? ""}
                      disabled={disabled}
                      placeholder="e.g. React, Node.js"
                      onChange={(event) => {
                        const projects = [...(value.projects ?? [])];
                        projects[index] = {
                          ...project,
                          technologies: event.target.value || undefined,
                        };
                        update({ projects });
                      }}
                    />
                  </Field>
                  <Field label="URL">
                    <Input
                      value={project.url ?? ""}
                      disabled={disabled}
                      onChange={(event) => {
                        const projects = [...(value.projects ?? [])];
                        projects[index] = {
                          ...project,
                          url: event.target.value || undefined,
                        };
                        update({ projects });
                      }}
                    />
                  </Field>
                  <Field label="Start date">
                    <Input
                      value={project.startDate ?? ""}
                      disabled={disabled}
                      onChange={(event) => {
                        const projects = [...(value.projects ?? [])];
                        projects[index] = {
                          ...project,
                          startDate: event.target.value || undefined,
                        };
                        update({ projects });
                      }}
                    />
                  </Field>
                  <Field label="End date">
                    <Input
                      value={project.endDate ?? ""}
                      disabled={disabled}
                      onChange={(event) => {
                        const projects = [...(value.projects ?? [])];
                        projects[index] = {
                          ...project,
                          endDate: event.target.value || undefined,
                        };
                        update({ projects });
                      }}
                    />
                  </Field>
                </div>
                <Field label="Bullets">
                  <div className="space-y-2">
                    {project.bullets.map((bullet, bulletIndex) => (
                      <div
                        key={`project-${index}-bullet-${bulletIndex}`}
                        className="flex gap-2"
                      >
                        <Input
                          value={bullet}
                          disabled={disabled}
                          onChange={(event) => {
                            const projects = [...(value.projects ?? [])];
                            const bullets = [...project.bullets];
                            bullets[bulletIndex] = event.target.value;
                            projects[index] = { ...project, bullets };
                            update({ projects });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={disabled}
                          onClick={() => {
                            const projects = [...(value.projects ?? [])];
                            projects[index] = {
                              ...project,
                              bullets: project.bullets.filter(
                                (_, i) => i !== bulletIndex,
                              ),
                            };
                            update({ projects });
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled}
                      className="gap-1"
                      onClick={() => {
                        const projects = [...(value.projects ?? [])];
                        projects[index] = {
                          ...project,
                          bullets: [...project.bullets, ""],
                        };
                        update({ projects });
                      }}
                    >
                      <Plus className="size-3.5" />
                      Add bullet
                    </Button>
                  </div>
                </Field>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Education"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className="gap-1"
            onClick={() =>
              update({
                education: [
                  ...value.education,
                  { degree: "", institution: "" },
                ],
              })
            }
          >
            <Plus className="size-3.5" />
            Add school
          </Button>
        }
      >
        {value.education.length === 0 ? (
          <p className="text-xs text-text-muted">Add education entries if needed.</p>
        ) : (
          <div className="space-y-4">
            {value.education.map((school, index) => (
              <div
                key={`school-${index}`}
                className="space-y-3 rounded-lg border border-border bg-surface p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Education {index + 1}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    className="gap-1 text-error"
                    onClick={() =>
                      update({
                        education: value.education.filter((_, i) => i !== index),
                      })
                    }
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Degree *">
                    <Input
                      value={school.degree}
                      disabled={disabled}
                      onChange={(event) => {
                        const education = [...value.education];
                        education[index] = {
                          ...school,
                          degree: event.target.value,
                        };
                        update({ education });
                      }}
                    />
                  </Field>
                  <Field label="Institution *">
                    <Input
                      value={school.institution}
                      disabled={disabled}
                      onChange={(event) => {
                        const education = [...value.education];
                        education[index] = {
                          ...school,
                          institution: event.target.value,
                        };
                        update({ education });
                      }}
                    />
                  </Field>
                  <Field label="Start date">
                    <Input
                      value={school.startDate ?? ""}
                      disabled={disabled}
                      onChange={(event) => {
                        const education = [...value.education];
                        education[index] = {
                          ...school,
                          startDate: event.target.value || undefined,
                        };
                        update({ education });
                      }}
                    />
                  </Field>
                  <Field label="End date / year">
                    <Input
                      value={school.endDate ?? school.year ?? ""}
                      disabled={disabled}
                      onChange={(event) => {
                        const education = [...value.education];
                        education[index] = {
                          ...school,
                          endDate: event.target.value || undefined,
                          year: event.target.value || undefined,
                        };
                        update({ education });
                      }}
                    />
                  </Field>
                  <Field label="Location">
                    <Input
                      value={school.location ?? ""}
                      disabled={disabled}
                      onChange={(event) => {
                        const education = [...value.education];
                        education[index] = {
                          ...school,
                          location: event.target.value || undefined,
                        };
                        update({ education });
                      }}
                    />
                  </Field>
                  <Field label="Details">
                    <Input
                      value={school.details ?? ""}
                      disabled={disabled}
                      placeholder="e.g. CGPA: 3.37 / 4.0"
                      onChange={(event) => {
                        const education = [...value.education];
                        education[index] = {
                          ...school,
                          details: event.target.value || undefined,
                        };
                        update({ education });
                      }}
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

export function validateTailoredResumeDraft(value: TailoredResume): string[] {
  const errors: string[] = [];

  if (!value.fullName.trim()) {
    errors.push("Full name is required.");
  }

  if (!value.summary.trim()) {
    errors.push("Summary is required.");
  }

  value.skills.forEach((skill, index) => {
    if (!skill.name.trim()) {
      errors.push(`Skill ${index + 1} needs a name.`);
    }
  });

  value.experience.forEach((job, index) => {
    if (!job.title.trim() || !job.company.trim() || !job.startDate.trim()) {
      errors.push(
        `Experience ${index + 1} needs title, company, and start date.`,
      );
    }

    if (job.bullets.every((bullet) => !bullet.trim())) {
      errors.push(`Experience ${index + 1} has no bullet points.`);
    }
  });

  (value.projects ?? []).forEach((project, index) => {
    if (!project.name.trim()) {
      errors.push(`Project ${index + 1} needs a name.`);
    }

    if (project.bullets.every((bullet) => !bullet.trim())) {
      errors.push(`Project ${index + 1} has no bullet points.`);
    }
  });

  value.education.forEach((school, index) => {
    if (!school.degree.trim() || !school.institution.trim()) {
      errors.push(`Education ${index + 1} needs degree and institution.`);
    }
  });

  (value.personalDetails ?? []).forEach((detail, index) => {
    if (!detail.label.trim() || !detail.value.trim()) {
      errors.push(`Personal detail ${index + 1} needs label and value.`);
    }
  });

  (value.links ?? []).forEach((link, index) => {
    if (!link.label.trim() || !link.url.trim()) {
      errors.push(`Link ${index + 1} needs label and URL.`);
    }
  });

  return errors;
}

export function sanitizeTailoredResumeDraft(
  value: TailoredResume,
): TailoredResume {
  return {
    ...value,
    fullName: value.fullName.trim(),
    headline: value.headline?.trim() || undefined,
    email: value.email?.trim() || undefined,
    phone: value.phone?.trim() || undefined,
    address: value.address?.trim() || undefined,
    location: value.location?.trim() || undefined,
    linkedinUrl: value.linkedinUrl?.trim() || undefined,
    summary: value.summary.trim(),
    personalDetails: (value.personalDetails ?? [])
      .map((detail) => ({
        label: detail.label.trim(),
        value: detail.value.trim(),
      }))
      .filter((detail) => detail.label && detail.value),
    links: (value.links ?? [])
      .map((link) => ({
        label: link.label.trim(),
        url: link.url.trim(),
      }))
      .filter((link) => link.label && link.url),
    skills: value.skills
      .map((skill) => ({
        name: skill.name.trim(),
        level: skill.level?.trim() || undefined,
        category: skill.category?.trim() || undefined,
      }))
      .filter((skill) => skill.name),
    experience: value.experience.map((job) => ({
      company: job.company.trim(),
      title: job.title.trim(),
      startDate: job.startDate.trim(),
      endDate: job.endDate?.trim() || undefined,
      location: job.location?.trim() || undefined,
      companyDescription: job.companyDescription?.trim() || undefined,
      bullets: job.bullets.map((bullet) => bullet.trim()).filter(Boolean),
    })),
    projects: (value.projects ?? []).map((project) => ({
      name: project.name.trim(),
      subtitle: project.subtitle?.trim() || undefined,
      technologies: project.technologies?.trim() || undefined,
      startDate: project.startDate?.trim() || undefined,
      endDate: project.endDate?.trim() || undefined,
      url: project.url?.trim() || undefined,
      bullets: project.bullets.map((bullet) => bullet.trim()).filter(Boolean),
    })),
    education: value.education.map((school) => ({
      degree: school.degree.trim(),
      institution: school.institution.trim(),
      year: school.year?.trim() || undefined,
      startDate: school.startDate?.trim() || undefined,
      endDate: school.endDate?.trim() || undefined,
      location: school.location?.trim() || undefined,
      details: school.details?.trim() || undefined,
    })),
    changesApplied: value.changesApplied,
  };
}
