'use server'

export type Res = {
  data: string
}

export async function uploadCOR(file: File): Promise<Res> {
  await new Promise((res) => setTimeout(res, 4000))

  return {
    data: `hello world`,
  }
}
