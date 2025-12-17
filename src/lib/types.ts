export interface Author {
  id: string
  name: string
  email: string
}

export type FieldType = 'image' | 'code' | 'link'

export interface Field {
  id?: string
  type: FieldType
  value: string
}

export interface Article {
  id: string
  title: string
  body: string
  fields: Field[]
  authorId: string
  author: Author
  createdAt: string
  updatedAt: string
}