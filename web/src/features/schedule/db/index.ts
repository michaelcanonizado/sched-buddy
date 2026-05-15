import { openDB } from 'idb'

export const DB_NAME = 'canvas-store'
export const DB_VERSION = 1
export const STORE_NAME = 'assets'

export function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    },
  })
}
