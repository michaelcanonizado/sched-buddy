import { FabricObject } from 'fabric'
import { create } from 'zustand'

type ScheduleStoreActions = {
  addObject: (object: FabricObject) => void
}

type ScheduleStoreState = {
  objects: Record<number, FabricObject>
  actions: ScheduleStoreActions
}

export const useScheduleStore = create<ScheduleStoreState>((set, get) => ({
  objects: {},
  actions: {
    addObject: (object: FabricObject) => {
      set((s) => ({
        objects: { ...s.objects, [object.data.id]: object },
      }))
      console.log(get().objects[67].fill)
    },
  },
}))
