'use server'

import z from 'zod'

const dataSchema = z.object({
  code: z.string(),
  subject: z.string(),
  units: z.object({
    credit: z.number(),
    lec: z.number(),
    lab: z.number(),
  }),
  class: z.string(),
  room: z.string(),
  faculty: z.string(),
  schedules: z.array(
    z.object({
      days: z.array(
        z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
      ),
      time: z.object({
        start: z.number(),
        end: z.number(),
      }),
    }),
  ),
})
type Data = z.infer<typeof dataSchema>

const dataArray = z.array(dataSchema)
type DataArray = z.infer<typeof dataArray>

export type Res = {
  data: DataArray
}

export async function uploadCOR(file: File): Promise<Res> {
  /* Call backendn */
  await new Promise((res) => setTimeout(res, 4000))

  /* Verify type */

  return {
    data: [],
  }
}
