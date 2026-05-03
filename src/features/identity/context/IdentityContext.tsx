import { createContext, useContext, useState, useEffect, type FC, type ReactNode, useCallback } from 'react';

interface IdentityContextValue {
  activeName: string | null;
  availableNames: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isDeveloper: boolean;
  setActiveName: (name: string) => Promise<void>;
}

const IdentityContext = createContext<IdentityContextValue>({
  activeName: null, availableNames: [], isLoading: true,
  isAuthenticated: false, isDeveloper: false, setActiveName: async () => {},
});

const DEV_NAMES = ['iffi', 'iffinland', 'iffivabamees'];

export const IdentityProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [activeName, setActiveNameState] = useState<string | null>(null);
  const [availableNames, setAvailableNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isDeveloper = activeName ? DEV_NAMES.includes(activeName.toLowerCase()) : false;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const acct = await (window as any).qortalRequest?.({ action: 'GET_USER_ACCOUNT' });
        if (cancelled) return;
        if (acct?.name) {
          setActiveNameState(acct.name);
          setAvailableNames(acct.name ? [acct.name] : []);
        }
      } catch { /* */ }
      if (!cancelled) setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const setActiveName = useCallback(async (name: string) => { setActiveNameState(name); }, []);

  return (
    <IdentityContext.Provider value={{ activeName, availableNames, isLoading, isAuthenticated: !!activeName, isDeveloper, setActiveName }}>
      {children}
    </IdentityContext.Provider>
  );
};

export const useIdentity = () => useContext(IdentityContext);
