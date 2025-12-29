import { Article, MenuTab } from "@/lib/types";
import { useState } from "react";

export default function MenuTabFields({ formData, setFormData }: { formData: Article, setFormData: any }) {
  const [isMenuTab, setIsMenuTab] = useState(!!formData.tab);
  const [menuTabName, setMenuTabName] = useState(formData.tab?.name || '');
  const [menuTabLink, setMenuTabLink] = useState(formData.tab?.link || ''); 
  const [menuTabOrder, setMenuTabOrder] = useState(formData.tab?.order || '');
  return (
      <div className="mb-4">
        {/* An checkbox labeld Menu Tab, when checked, an additional text inpput appears labled name */}
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            // onChange handler to toggle menu tab
            checked={isMenuTab}
            onChange={() => {
              setIsMenuTab(!isMenuTab);
              if (!isMenuTab) {
                setFormData({ ...formData, tab: { name: menuTabName, link: menuTabLink, order: menuTabOrder } });
              } else {
                setFormData({ ...formData, tab: undefined });
              }
            }}
          />
          <span className="text-sm font-medium text-gray-700">Menu Tab</span>
        </label>
        {/* If Menu Tab is checked, show the following input */}
        {isMenuTab && (
          <>
          <div className="mt-2">
            <label htmlFor="menuTabName" className="block text-sm font-medium text-gray-700">
              Menu Tab Name
            </label>
            <input
              type="text"
              name="menuTabName"
              id="menuTabName"
              value={menuTabName}
              onChange={(e) => { setMenuTabName(e.target.value); setFormData({ ...formData, tab: { name: e.target.value, link: menuTabLink, order: menuTabOrder } }); }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="mt-2" hidden={formData !== undefined} >
            <label htmlFor="menuTabLink" className="block text-sm font-medium text-gray-700">
              Menu Tab Link
            </label>
            <input
              hidden={formData !== undefined} // Disable if editing article
              type="text"
              name="menuTabLink"
              id="menuTabLink"
              value={menuTabLink}
              onChange={(e) => { setMenuTabLink(e.target.value); setFormData({ ...formData, tab: { name: menuTabName, link: e.target.value, order: menuTabOrder } }); }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
           <div className="mt-2" >
            <label htmlFor="menuTabOrder" className="block text-sm font-medium text-gray-700">
              Menu Tab Order
            </label>
            <input
              type="number"
              name="menuTabOrder"
              id="menuTabOrder"
              value={menuTabOrder}
              onChange={(e) => { setMenuTabOrder(e.target.value); setFormData({ ...formData, tab: { name: menuTabName, link: menuTabLink, order: e.target.value } }); }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          </>
        )}

      </div>
  )
}