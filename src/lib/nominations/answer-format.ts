/**
 * Shared, pure helpers for turning stored nomination answers into display values.
 *
 * Storage model (table `application_answers`, one row per application + question):
 *   - answer_text   : text / textarea / url answers, and the selected option VALUE for `select`
 *   - answer_number : numeric answers
 *   - answer_json   : array of selected option VALUES for `checkbox`
 * Human-readable labels live in `question_options` (label/value per question).
 *
 * Used by the admin dossier, jury dossier and deliberation dossier so all three show
 * exactly what the applicant saved, formatted identically.
 */

export interface AnswerOption {
  label: string;
  value: string;
}

export interface RawAnswer {
  text?: string | null;
  number?: number | string | null;
  json?: unknown;
}

export type FormattedAnswer =
  | { kind: "empty" }
  | { kind: "text"; text: string }
  | { kind: "list"; items: string[] };

function labelFor(options: AnswerOption[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

function jsonToValues(json: unknown): string[] {
  if (json === null || json === undefined) return [];
  if (Array.isArray(json)) return json.map((v) => String(v)).filter((v) => v.trim() !== "");
  if (typeof json === "object") {
    // Tolerate { value: true } style maps
    return Object.entries(json as Record<string, unknown>)
      .filter(([, v]) => v === true || v === "true")
      .map(([k]) => k);
  }
  const s = String(json).trim();
  return s ? [s] : [];
}

/**
 * Format a stored answer for display.
 * "empty" is returned ONLY when the applicant genuinely provided no value
 * (a numeric 0 is a real answer and is NOT treated as empty).
 */
export function formatAnswer(
  fieldType: string,
  options: AnswerOption[],
  raw: RawAnswer | null | undefined
): FormattedAnswer {
  if (!raw) return { kind: "empty" };

  const text = typeof raw.text === "string" ? raw.text.trim() : "";
  const hasNumber =
    raw.number !== null && raw.number !== undefined && String(raw.number).trim() !== "";
  const jsonValues = jsonToValues(raw.json);

  switch (fieldType) {
    case "select":
    case "radio": {
      if (!text) break;
      return { kind: "text", text: labelFor(options, text) };
    }
    case "checkbox":
    case "multiselect": {
      const values = jsonValues.length > 0 ? jsonValues : text ? [text] : [];
      if (values.length === 0) break;
      return { kind: "list", items: values.map((v) => labelFor(options, v)) };
    }
    case "number": {
      if (hasNumber) return { kind: "text", text: String(raw.number) };
      if (text) return { kind: "text", text };
      break;
    }
    default: {
      if (text) return { kind: "text", text };
      if (jsonValues.length > 0) return { kind: "list", items: jsonValues.map((v) => labelFor(options, v)) };
      if (hasNumber) return { kind: "text", text: String(raw.number) };
    }
  }
  return { kind: "empty" };
}

/** Plain-string form (e.g. for exports / read-only summaries). Empty answers become "". */
export function formatAnswerAsString(
  fieldType: string,
  options: AnswerOption[],
  raw: RawAnswer | null | undefined
): string {
  const f = formatAnswer(fieldType, options, raw);
  if (f.kind === "text") return f.text;
  if (f.kind === "list") return f.items.join(", ");
  return "";
}

export const NOT_PROVIDED_LABEL = "Not provided";
