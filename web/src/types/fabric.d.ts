import { FabricObject } from 'fabric'

declare module 'fabric' {
  interface FabricObject {
    id?: string
  }

  interface FabricObjectProps {
    id?: string
  }
}
