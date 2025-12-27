
import { useCreateBlockNote } from "@blocknote/react"
import "@blocknote/mantine/style.css"
import { BlockNoteView } from "@blocknote/mantine";
import { useEffect, useState } from "react";

export default function BlockNoteEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual')
    const [error, setError] = useState('')
    const [isLoadingValue, setIsLoadingValue] = useState(true)

    const uploadFile = async (file: File): Promise<string | Record<string, any>> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string | Record<string, any> | PromiseLike<string | Record<string, any>>); // This is the base64 string
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file); // Converts the file to a Data URL
      });
    };
    const editor = useCreateBlockNote({
      uploadFile,
    })
    useEffect(() => {
      const loadValue = async () => {
        try {
          // Load HTML content into BlockNote editor
          if (value && editor && isLoadingValue) {
            const blocks = await editor.tryParseHTMLToBlocks(value)
            editor.replaceBlocks(editor.document, blocks)
          }
        } catch (err: any) {
          setError(err.message)
        } finally {
          setIsLoadingValue(false)
        }
      } 
  
      loadValue()
    }, [value])


    const toggleEditorMode = async () => {
      if (editorMode === 'visual') {
        // Switch to HTML mode: convert editor content to HTML
        const htmlContent = await editor.blocksToFullHTML(editor.document)
        onChange(htmlContent)
        setEditorMode('html')
      } else {
        // Switch to visual mode: parse HTML back to blocks
        const blocks = await editor.tryParseHTMLToBlocks(value)
        editor.replaceBlocks(editor.document, blocks)
        setEditorMode('visual')
      }
    }

  if (error) {
    return <div className="text-red-500">Error loading editor: {error}</div>
  }

  if (isLoadingValue) {
    return <div className="text-gray-500">Loading editor...</div>
  } 

  return (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="body" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <button
              type="button"
              onClick={toggleEditorMode}
              className="text-xs px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              {editorMode === 'visual' ? '< > HTML' : '📝 Visual'}
            </button>
          </div>
          {editorMode === 'visual' ? (
            <div className="mt-1">
              <BlockNoteView editor={editor} theme="light" onChange={async (editor) => onChange(await editor.blocksToFullHTML(editor.document))}/>
            </div>
          ) : (
            <textarea
              name="body"
              id="body"
              rows={15}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono text-xs"
            />
          )}
        </div>
  )
}