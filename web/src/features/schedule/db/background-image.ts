import { getDb, STORE_NAME } from '.'

async function saveBackgroundImageDB(blob: Blob): Promise<void> {
  const db = await getDb()
  await db.put(STORE_NAME, blob, 'background-image')
}

async function loadBackgroundImageDB(): Promise<Blob | undefined> {
  const db = await getDb()
  return db.get(STORE_NAME, 'background-image')
}

async function deleteBackgroundImageDB(): Promise<void> {
  const db = await getDb()
  await db.delete(STORE_NAME, 'background-image')
}

let cachedBackgroundUrl: string | null = null

export async function setBackgroundImageDB(url: string | null): Promise<void> {
  /* If user wants to remove the image */
  if (!url) {
    await deleteBackgroundImageDB()
    cachedBackgroundUrl = null
    return
  }

  /* If user wants to add an image */
  const blob = await fetch(url).then((r) => r.blob())
  await saveBackgroundImageDB(blob)

  /* If there is a cached image, remove it */
  if (cachedBackgroundUrl) URL.revokeObjectURL(cachedBackgroundUrl)

  /* Recache the new image */
  cachedBackgroundUrl = URL.createObjectURL(blob)
}

export async function getBackgroundImageDB(): Promise<string | null> {
  if (cachedBackgroundUrl) return cachedBackgroundUrl

  const blob = await loadBackgroundImageDB()
  if (!blob) return null

  cachedBackgroundUrl = URL.createObjectURL(blob)

  return cachedBackgroundUrl
}
