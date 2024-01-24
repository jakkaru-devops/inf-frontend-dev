import { FC, ReactNode } from 'react';

const FormError: FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="form-error">{children}</div>;
};

export default FormError;
