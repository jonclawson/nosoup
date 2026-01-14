'use client'
import { useSession } from 'next-auth/react';
import React from 'react';
import BlockNoteEditor from './BlockNoteEditor';
import Dompurify from './Dompurify';
import { useDebounce } from '@/lib/debounce';

export default function ContentEdit({type, onChange, children}: {type?: string, onChange?: (value: any) => void, children?: React.ReactNode}) {
  const [value, setValue] = React.useState<any>(children);
  const [editing, setEditing] = React.useState(false);
  const {data: session, status} = useSession();

  const handleChange = useDebounce((val: any) => {
    setValue(val);
    if (onChange) {
      onChange(val);
    }
  }, 300);

  
  if (editing) {
    const DoneEditingButton = () => <button className="ml-2 px-2 py-1 bg-blue-500 text-white rounded" onClick={() => setEditing(false)}>Done</button>
    switch (type) {
      case 'text':
        return (
          <div>
            <input 
            defaultValue={value} 
            onChange={(e) => handleChange(e.target.value)}
            />
            <DoneEditingButton />
          </div>
        );
      default:
        return (
          <div>
              <BlockNoteEditor 
              value={value.toString()} 
              onChange={(value) => {
                setValue(value);
                if (onChange) {
                  onChange(value);
                }
              }}
              />
            <DoneEditingButton />
          </div>
        );
    }
  }

  if ( session && session?.user?.role === 'admin') {
    return (
      <>
        {typeof value === 'object' ? value : <Dompurify html={value || ''} />}
       
        <span onClick={() => setEditing(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block text-blue-600 hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </span>
      </>
    )
  }

  return <>{typeof value === 'object' ? value : <Dompurify html={value || ''} />}</>;
}