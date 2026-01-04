import { createContext, useContext, useState, ReactNode } from 'react';

interface StateContextType {
  siteName: string;
  // Add other variables here, e.g., userPrefs: object;
  setSiteName: (name: string) => void;
  setSetting: (key: string, value: any) => void;
  getSetting: (key: string) => any;
  // Add setters for other variables
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider = ({ children }: { children: ReactNode }) => {
  const [siteName, setSiteName] = useState(process.env.NEXT_PUBLIC_SITE_NAME || 'NoSoup');
  const [settings, setSettings] = useState<Record<string, any>>({});
  const setSetting = (key: string, value: any) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
  }
  const getSetting = (key: string) => {
    return settings[key];
  }
  // Add other state here

  return (
    <StateContext.Provider value={{ siteName, setSiteName, setSetting, getSetting }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) throw new Error('useStateContext must be used within StateProvider');
  return context;
};