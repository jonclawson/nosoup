import { Article, Tag } from "@/lib/types";
import { useState } from "react";

export default function TagsComponent({ formData, setFormData }: { formData: Article, setFormData: any }) {
  //  creat list of tags with add and remove functionality
  // const [tags, setTags] = useState<Tag[]>(formData.tags || []);
  const tags = formData.tags || [];
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([
    { name: 'JavaScript' },
    { name: 'TypeScript' },
    { name: 'React' },
    { name: 'Next.js' },
    { name: 'Node.js' },
    { name: 'CSS' },
    { name: 'HTML' },
  ]);

  const addTag = () => {
    if (newTag.trim() !== '') {
      const tagToAdd = { name: newTag.trim() };
      // setTags([...tags, tagToAdd]);
      setFormData({ ...formData, tags: [...tags, tagToAdd] });
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    // setTags(updatedTags);
    setFormData({ ...formData, tags: updatedTags });
  };

  return (
    <div>
      {/* Tags component implementation */}
      <label htmlFor="new-tag" className="block text-sm font-medium text-gray-700">
        Tags
      </label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
          >
            {tag.name}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-2 inline-flex items-center justify-center w-4 h-4 text-blue-500 bg-blue-100 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <div className="mb-4">
        <div className="mt-1 flex">
          <input
            type="text"
            id="new-tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={addTag}
            className="ml-2 inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
      </div>
      {/* Show list of matching available tags as user types in the new-tag input */}
      {newTag.trim() !== '' && (
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-700 mb-1">Available Tags:</p>
          <div className="flex flex-wrap gap-2">
            {availableTags
              .filter((tag) =>
                tag.name.toLowerCase().includes(newTag.toLowerCase()) &&
                !tags.some((t) => t.name === tag.name)
              )
              .map((tag, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    // setTags([...tags, tag]);
                    setFormData({ ...formData, tags: [...tags, tag] });
                    setNewTag('');
                  }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200"
                >
                  {tag.name}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}