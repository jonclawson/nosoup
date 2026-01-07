export type Author = User

export interface MenuTab {
  id?: string
  name: string
  link: string
  order: number
}

export type FieldType = 'image' | 'code' | 'link'

export interface Field {
  id?: string
  type: FieldType
  value: string
  meta?: any
}

export interface Tag {
  id?: string
  name: string
} 
export interface Article {
  id?: string
  slug?: string
  title: string
  body: string
  fields: Field[]
  tags?: Tag[]
  authorId?: string
  author?: User
  createdAt?: string | Date
  updatedAt?: string | Date
  published?: boolean
  featured?: boolean
  sticky?: boolean
  tab?: MenuTab
}

export interface Setting {
  key: string
  value: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'moderator' | 'user'
}
