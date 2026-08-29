import { SchemaDraftState } from './types';

const STORAGE_KEY = 'tooltive_schema_generator_draft_v1';

export function saveDraft(state: Partial<SchemaDraftState>) {
  if (typeof window === 'undefined') return;
  try {
    const currentState = loadDraft() || { version: 1, timestamp: Date.now() };
    const newState: SchemaDraftState = {
      ...currentState,
      ...state,
      version: 1,
      timestamp: Date.now()
    } as SchemaDraftState;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  } catch (e) {
    console.error('Failed to save schema draft', e);
  }
}

export function loadDraft(): SchemaDraftState | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    
    // Check version
    if (parsed.version !== 1) {
      console.warn('Schema draft version mismatch. Discarding old draft.');
      clearDraft();
      return null;
    }
    
    return parsed as SchemaDraftState;
  } catch (e) {
    console.error('Failed to load schema draft. Corrupted JSON?', e);
    clearDraft();
    return null;
  }
}

export function clearDraft() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // Ignore
  }
}
