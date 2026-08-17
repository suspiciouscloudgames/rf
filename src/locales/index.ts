import en from './en.json'
import ja from './ja.json'
import ko from './ko.json'
import type { Language } from '../store/experienceStore'

export const localeCopy = { ja, ko, en } satisfies Record<Language, typeof ja>
