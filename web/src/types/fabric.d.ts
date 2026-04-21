import { FabricObject } from 'fabric'

declare module 'fabric' {
  interface FabricObject {
    id?: string
    toSave?: boolean
  }

  interface FabricObjectProps {
    id?: string
    toSave?: boolean
  }
}
