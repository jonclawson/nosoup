'use client'
import type { Article, Field, Author, FieldType } from '@/lib/types'

export default function EditArticleFields({ formData, setFormData }: { formData: Article, setFormData: any }) {
    const handleFieldChange = (index: number, value: string, meta: File | null = null) => {
    const updatedFields = [...formData.fields]
    updatedFields[index].value = value
    if (meta) {
      updatedFields[index].meta = { file: meta }
    }
    setFormData({ ...formData, fields: updatedFields })
  }

  const handleAddField = (type: FieldType) => {
    const newField: Field = { type: type, value: '' }
    setFormData({ ...formData, fields: [...formData.fields, newField] })
  }

  const handleRemoveField = (index: number) => {
    const updatedFields = [...formData.fields]
    updatedFields.splice(index, 1)
    setFormData({ ...formData, fields: updatedFields })
  }
  return (
    <div>
      <label htmlFor="fields" className="block text-sm font-medium text-gray-700">
        Fields
      </label>
      <div className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-4 bg-gray-50 text-sm text-gray-500">
        {/* load each field value of fields in inputs */}
        {formData?.fields && formData.fields.length > 0 ? (
          formData.fields.map((field, index) => (
            <div key={index} className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                {field.type.charAt(0).toUpperCase() + field.type.slice(1)} Field
                {/* circle with an x to remove field when clicked */}
                <button
                  type="button"
                  onClick={() => handleRemoveField(index)}
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  &times;
                </button>
              </label>
              {/* for type code, use textarea, for image, use file upload, for link, use input */}
              {field.type === 'code' ? (
                <textarea
                  name="fields[]"
                  id={field.id}
                  rows={6}
                  value={field.value}
                  onChange={(e) => handleFieldChange(index, e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm bg-white p-2"
                />
              ) : field.type === 'image' ? (
                <label htmlFor={field.id} className="block cursor-pointer">
                  {field.meta?.file || !!field.value ? (
                    <img src={field.meta?.file ? URL.createObjectURL(field.meta.file) : field.value} alt="Field Image" className="max-w-full h-auto mb-2"/>
                  ) : 'Click to upload image'}
                  <input
                    name="fields[]"
                    id={field.id}
                    type="file"
                    // value={field.value}
                    onChange={(e) => handleFieldChange(index, e.target.value, e.target.files?.[0] ?? null)}
                    className="opacity-0 w-full rounded-md border-gray-300 shadow-sm bg-white p-2"
                    />
                    {field.meta?.file?.name || field.value.split('/').pop()}
                  </label>
              ) : field.type === 'link' ? (
                <input
                  name="fields[]"
                  id={field.id}
                  type="text"
                  value={field.value}
                  onChange={(e) => handleFieldChange(index, e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm bg-white p-2"
                />
              ) : (
                <input
                  name="fields[]"
                  id={field.id}
                  type="text"
                  value={field.value}
                  onChange={(e) => handleFieldChange(index, e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm bg-white p-2"
                />
              )}    
            </div>
          ))
        ) : (
          <div>No fields available.</div>
        )}
      </div>
      {/* add field button */}
      {/* Change the button to be a select with values of code, image or link and resets the value on change */}
      <select
        onChange={(e) => {
          handleAddField(e.target.value as FieldType);
          e.target.value = "";
        }}
        className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <option value="">Add Field</option>
        <option value="code">Code</option>
        <option value="image">Image</option>
        <option value="link">Link</option>
      </select>
    </div>
    )
}
    