"use client";

import { useState } from "react";
import type {
  ChoiceLongOption,
  ChoiceQuestion,
  ChoiceWithNoteQuestion,
  MultiChoiceQuestion,
  ScaleQuestion,
  TextQuestion,
} from "@/lib/questionnaire";
import { CheckIcon } from "../icons";

function renderLongOptions(
  options: ChoiceLongOption[],
  selected: string,
  onSelect: (value: string) => void,
) {
  return (
    <div className="opts opt-cards">
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          className={selected === option.value ? "opt-card is-picked" : "opt-card"}
          onClick={() => onSelect(option.value)}
          aria-pressed={selected === option.value}
        >
          <span className="opt-card-badge">{option.value}</span>
          <span className="opt-card-text">{option.text}</span>
        </button>
      ))}
    </div>
  );
}

export function TextControl({
  question,
  value,
  onChange,
}: {
  question: TextQuestion;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <textarea
      className="input"
      rows={question.tall ? 7 : 4}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Answer in your own words…"
    />
  );
}

export function ChoiceControl({
  question,
  value,
  onChange,
}: {
  question: ChoiceQuestion;
  value?: string;
  onChange: (value: string) => void;
}) {
  const [otherActive, setOtherActive] = useState(
    () => value !== undefined && value !== "" && !question.options.includes(value),
  );
  const otherLabel = question.otherLabel ?? "Other";

  return (
    <>
      <div className="opts">
        {question.options.map((option) => (
          <button
            type="button"
            key={option}
            className={!otherActive && value === option ? "opt is-picked" : "opt"}
            onClick={() => {
              setOtherActive(false);
              onChange(option);
            }}
            aria-pressed={!otherActive && value === option}
          >
            <span className="opt-mark">
              <CheckIcon />
            </span>
            {option}
          </button>
        ))}
        {question.allowOther && (
          <button
            type="button"
            className={otherActive ? "opt is-picked" : "opt"}
            onClick={() => {
              setOtherActive(true);
              onChange("");
            }}
            aria-pressed={otherActive}
          >
            <span className="opt-mark">
              <CheckIcon />
            </span>
            {otherLabel}
          </button>
        )}
      </div>
      {otherActive && (
        <input
          type="text"
          className="input"
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={otherLabel}
          autoFocus
        />
      )}
    </>
  );
}

export function ChoiceWithNoteControl({
  question,
  value,
  onChange,
}: {
  question: ChoiceWithNoteQuestion;
  value?: string[];
  onChange: (value: string[]) => void;
}) {
  const [selected, setSelected] = useState(() => value?.[0] ?? "");
  const [note, setNote] = useState(() => value?.[1] ?? "");

  return (
    <>
      {renderLongOptions(question.options, selected, (next) => {
        setSelected(next);
        onChange([next, note]);
      })}
      <label className="field">
        <span className="label">{question.notePrompt ?? "What's off?"}</span>
        <textarea
          className="input"
          rows={3}
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
            onChange([selected, event.target.value]);
          }}
          placeholder="Close but…"
        />
      </label>
    </>
  );
}

export function MultiChoiceControl({
  question,
  value,
  onChange,
}: {
  question: MultiChoiceQuestion;
  value?: string[];
  onChange: (value: string[]) => void;
}) {
  const initial = value ?? [];
  const initialOther = initial.find((v) => !question.options.includes(v)) ?? "";
  const [checked, setChecked] = useState<string[]>(() =>
    initial.filter((v) => question.options.includes(v)),
  );
  const [otherActive, setOtherActive] = useState(() => initialOther.length > 0);
  const [otherText, setOtherText] = useState(() => initialOther);

  const emit = (nextChecked: string[], nextOtherActive: boolean, nextOtherText: string) => {
    const extra = nextOtherActive && nextOtherText.trim() ? [nextOtherText.trim()] : [];
    onChange([...nextChecked, ...extra]);
  };

  const totalCount = checked.length + (otherActive && otherText.trim() ? 1 : 0);
  const atMax = question.max !== undefined && totalCount >= question.max;
  const otherLabel = question.otherLabel ?? "Other";

  const toggleOption = (option: string) => {
    const isChecked = checked.includes(option);
    const next = isChecked
      ? checked.filter((o) => o !== option)
      : atMax
        ? checked
        : [...checked, option];
    setChecked(next);
    emit(next, otherActive, otherText);
  };

  const toggleOther = () => {
    const next = !otherActive;
    if (next && atMax) return;
    setOtherActive(next);
    emit(checked, next, otherText);
  };

  return (
    <>
      <div className="opts">
        {question.options.map((option) => {
          const isChecked = checked.includes(option);
          return (
            <button
              type="button"
              key={option}
              className={isChecked ? "opt opt-check is-picked" : "opt opt-check"}
              onClick={() => toggleOption(option)}
              aria-pressed={isChecked}
              disabled={!isChecked && atMax}
            >
              <span className="opt-mark opt-mark-check">
                <CheckIcon />
              </span>
              {option}
            </button>
          );
        })}
        {question.allowOther && (
          <button
            type="button"
            className={otherActive ? "opt opt-check is-picked" : "opt opt-check"}
            onClick={toggleOther}
            aria-pressed={otherActive}
            disabled={!otherActive && atMax}
          >
            <span className="opt-mark opt-mark-check">
              <CheckIcon />
            </span>
            {otherLabel}
          </button>
        )}
      </div>
      {otherActive && (
        <input
          type="text"
          className="input"
          value={otherText}
          onChange={(event) => {
            setOtherText(event.target.value);
            emit(checked, true, event.target.value);
          }}
          placeholder={otherLabel}
          autoFocus
        />
      )}
      <span className="opt-limit">
        {totalCount} selected{question.max !== undefined ? ` (up to ${question.max})` : ""}
      </span>
    </>
  );
}

export function ScaleControl({
  question,
  value,
  onChange,
}: {
  question: ScaleQuestion;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="scale">
      <span className="scale-label">{question.leftLabel}</span>
      <div className="scale-pips">
        {["1", "2", "3", "4", "5"].map((n) => (
          <button
            type="button"
            key={n}
            className={value === n ? "scale-pip is-picked" : "scale-pip"}
            onClick={() => onChange(n)}
            aria-pressed={value === n}
          >
            {n}
          </button>
        ))}
      </div>
      <span className="scale-label">{question.rightLabel}</span>
    </div>
  );
}
