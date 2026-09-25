import {
  createDoNotFeature as createDoNotFeatureQuery,
  updateDoNotFeature as updateDoNotFeatureQuery,
  getDoNotFeatureById,
  getDoNotFeatureByName,
  getDoNotFeatureList,
  deleteDoNotFeature,
} from '@/lib/db/queries';
import { ContentItem, DoNotFeature } from '@/lib/types';

export interface CreateDoNotFeatureInput {
  name: string;
  requestedAt?: string;
  note?: string | null;
  enabled?: boolean;
}

export interface UpdateDoNotFeatureInput {
  name?: string;
  requestedAt?: string;
  note?: string | null;
  enabled?: boolean;
}

/**
 * Insert a new entry into the do_not_feature table.
 */
export async function insertDoNotFeature(
  data: CreateDoNotFeatureInput
): Promise<DoNotFeature> {
  return createDoNotFeatureQuery(data);
}

export const createDoNotFeature = insertDoNotFeature;
export const addDoNotFeature = insertDoNotFeature;

/**
 * Update an existing entry in the do_not_feature table.
 */
export async function updateDoNotFeature(
  id: string,
  data: UpdateDoNotFeatureInput
): Promise<DoNotFeature | null> {
  return updateDoNotFeatureQuery(id, data);
}

export const modifyDoNotFeature = updateDoNotFeature;
export const editDoNotFeature = updateDoNotFeature;

/**
 * Retrieve a do_not_feature entry by its ID.
 */
export async function getDoNotFeature(id: string): Promise<DoNotFeature | null> {
  return getDoNotFeatureById(id);
}

/**
 * List all do_not_feature entries with optional filters.
 */
export async function listDoNotFeatures(filters?: {
  enabled?: boolean;
  search?: string;
}): Promise<DoNotFeature[]> {
  return getDoNotFeatureList(filters);
}

/**
 * Delete a do_not_feature entry by ID.
 */
export async function removeDoNotFeature(id: string): Promise<boolean> {
  return deleteDoNotFeature(id);
}

/**
 * Check if a person or organization is actively marked as do-not-feature.
 */
export async function isDoNotFeature(name: string): Promise<boolean> {
  const record = await getDoNotFeatureByName(name);
  return Boolean(record && record.enabled);
}

/**
 * Text fields of a candidate, submission or content item that are checked
 * against the do-not-feature list.
 */
export interface DoNotFeatureSubject {
  contactOrganization?: SubjectValue;
  contactName?: SubjectValue;
  title?: SubjectValue;
  summary?: SubjectValue;
  body?: SubjectValue;
  url?: SubjectValue;
}

type SubjectValue = string | Array<string | null | undefined> | null | undefined;

export type DoNotFeatureField = keyof DoNotFeatureSubject;

export interface DoNotFeatureMatch extends DoNotFeature {
  matchedFields: DoNotFeatureField[];
}

export interface DoNotFeatureCheck {
  blocked: boolean;
  matches: DoNotFeatureMatch[];
}

const SUBJECT_FIELDS: DoNotFeatureField[] = [
  'contactOrganization',
  'contactName',
  'title',
  'summary',
  'body',
  'url',
];

const FIELD_LABELS: Record<DoNotFeatureField, string> = {
  contactOrganization: 'contact organization',
  contactName: 'contact name',
  title: 'title',
  summary: 'summary',
  body: 'body',
  url: 'url',
};

// Trailing legal-entity suffixes ignored when matching, so "Brightlane Co"
// matches "Brightlane", "Brightlane Inc." and "brightlane.com".
const ENTITY_SUFFIXES = new Set([
  'co',
  'company',
  'corp',
  'corporation',
  'inc',
  'incorporated',
  'llc',
  'ltd',
  'limited',
  'plc',
  'gmbh',
  'sa',
]);

/** Lowercase, strip accents, and turn punctuation into single spaces. */
function normalizeText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Normalized entry name with trailing entity suffixes removed. */
export function normalizeEntityName(name: string): string {
  const words = normalizeText(name).split(' ').filter(Boolean);
  while (words.length > 1 && ENTITY_SUFFIXES.has(words[words.length - 1])) {
    words.pop();
  }
  return words.join(' ');
}

function hostnameLabels(url: string): string[] {
  try {
    return new URL(url).hostname.toLowerCase().split('.');
  } catch {
    return [];
  }
}

function fieldMatches(field: DoNotFeatureField, value: string, entityName: string): boolean {
  // Whole-word match so "Brightlane" does not hit "Brightlanes" or "unbrightlane".
  if (` ${normalizeText(value)} `.includes(` ${entityName} `)) return true;
  // "Bright Lane" should still match https://www.brightlane.com
  if (field === 'url') {
    const compact = entityName.replace(/ /g, '');
    return hostnameLabels(value).includes(compact);
  }
  return false;
}

/**
 * Pure matcher: which of the given entries hit the subject. Disabled entries
 * are ignored.
 */
export function findDoNotFeatureMatches(
  subject: DoNotFeatureSubject,
  entries: DoNotFeature[]
): DoNotFeatureMatch[] {
  const matches: DoNotFeatureMatch[] = [];
  for (const entry of entries) {
    if (!entry.enabled) continue;
    const entityName = normalizeEntityName(entry.name);
    if (!entityName) continue;

    const matchedFields = SUBJECT_FIELDS.filter((field) =>
      ([] as SubjectValue[])
        .concat(subject[field])
        .some((value) => typeof value === 'string' && value && fieldMatches(field, value, entityName))
    );
    if (matchedFields.length) matches.push({ ...entry, matchedFields });
  }
  return matches;
}

export async function loadEnabledDoNotFeatures(): Promise<DoNotFeature[]> {
  return getDoNotFeatureList({ enabled: true });
}

/**
 * Check a subject against the enabled do-not-feature entries. A match blocks
 * publication regardless of consent status. Pass `entries` to reuse an
 * already-loaded list when checking many items.
 */
export async function checkDoNotFeature(
  subject: DoNotFeatureSubject,
  entries?: DoNotFeature[]
): Promise<DoNotFeatureCheck> {
  const matches = findDoNotFeatureMatches(subject, entries ?? (await loadEnabledDoNotFeatures()));
  return { blocked: matches.length > 0, matches };
}

export function doNotFeatureSubjectFromContentItem(item: ContentItem): DoNotFeatureSubject {
  return {
    contactOrganization: item.contactOrganization,
    contactName: item.contactName,
    title: item.title,
    summary: item.summary,
    body: item.body,
    url: item.url,
  };
}

/** Human-readable list of matched entries, e.g. `"Brightlane Co" (contact organization, title)`. */
export function describeDoNotFeatureMatches(matches: DoNotFeatureMatch[]): string {
  return matches
    .map(
      (match) =>
        `"${match.name}" (matched ${match.matchedFields.map((f) => FIELD_LABELS[f]).join(', ')})`
    )
    .join('; ');
}

export function formatDoNotFeatureError(matches: DoNotFeatureMatch[]): string {
  return `Blocked by do_not_feature list: ${describeDoNotFeatureMatches(matches)}. do_not_feature overrides consent; disable the entry to allow this content.`;
}

export {
  getDoNotFeatureById,
  getDoNotFeatureByName,
  getDoNotFeatureList,
  deleteDoNotFeature,
};
