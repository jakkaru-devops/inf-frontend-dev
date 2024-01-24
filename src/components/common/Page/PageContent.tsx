import classNames from 'classnames';
import Container from '../Container';
import { IContainerProps } from '../Container/interfaces';
import { CSSProperties, FC, ReactNode } from 'react';

interface IProps {
  className?: string;
  containerProps?: IContainerProps;
  style?: CSSProperties;
  children: ReactNode;
}

const PageContent: FC<IProps> = ({
  className,
  containerProps,
  style,
  children,
}) => {
  return (
    <Container
      size="middle"
      {...containerProps}
      className={classNames(['app-page__content', className])}
      style={{
        ...style,
        ...containerProps?.style,
      }}
    >
      {children}
    </Container>
  );
};

export default PageContent;
