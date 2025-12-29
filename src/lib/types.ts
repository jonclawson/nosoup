export interface Author {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
}

export interface MenuTab {
  id?: string
  name: string
  link: string
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
  author?: Author
  createdAt?: string
  updatedAt?: string
  published?: boolean
  featured?: boolean
  sticky?: boolean
  tab?: MenuTab
}