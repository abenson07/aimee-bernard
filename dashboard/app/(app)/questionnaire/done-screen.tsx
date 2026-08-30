"use client";

import Link from "next/link";
import { FIELDS, PAGES, SECTIONS, type StoredAnswer } from "@/lib/questionnaire";
import { CheckIcon, ChevronRightIcon, CloseIcon } from "../icons";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function DoneScreen({
  answers,
  startedAt,
  completedAt,
  onJumpToSection,
}: {
  answers: StoredAnswer[];
  startedAt?: string;
  completedAt?: string;
  onJumpToSection: (sectionId: number) => void;
}) {
  const answeredCount = answers.length;
  const skippedCount = FIELDS.length - answeredCount;

  return (
    <div className="q-page">
      <header className="q-header">
        <Link href="/" className="x-btn" aria-label="Back to dashboard">
          <CloseIcon />
        </Link>
      </header>

      <div className="done">
        <span className="done-mark">
          <CheckIcon size={20} weight="1.7" />
        </span>
        <span className="done-title">Voice &amp; Tone Questionnaire complete</span>
        <span className="done-sub">
          {answeredCount} answered, {skippedCount} skipped.
          {startedAt && completedAt && (
            <>
              {" "}
              Started {dateFormat.format(new Date(startedAt))}, completed{" "}
              {dateFormat.format(new Date(completedAt))}.
            </>
          )}
        </span>
      </div>

      <div className="section-nav">
        {SECTIONS.map((section) => {
          const sectionFields = PAGES.filter((p) => p.section === section.id).flatMap(
            (p) => p.fields,
          );
          const sectionAnswered = sectionFields.filter((f) =>
            answers.some((a) => a.key === f.key),
          ).length;
          return (
            <button
              type="button"
              key={section.id}
              className="section-nav-item"
              onClick={() => onJumpToSection(section.id)}
            >
              {section.title}
              <span className="section-nav-count">
                {sectionAnswered} of {sectionFields.length}
              </span>
              <ChevronRightIcon />
            </button>
          );
        })}
      </div>
    </div>
  );
}
