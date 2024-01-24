import { ISetState } from 'interfaces/common.interfaces';
import { FC, ReactNode, createContext, useState } from 'react';

interface IContext {
  summaryContentLeft: ReactNode;
  setSummaryContentLeft: ISetState<IContext['summaryContentLeft']>;
}

export const Context = createContext<IContext>({
  summaryContentLeft: null,
  setSummaryContentLeft: null,
});

const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [summaryContentLeft, setSummaryContentLeft] = useState(null);

  return (
    <Context.Provider value={{ summaryContentLeft, setSummaryContentLeft }}>
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;
