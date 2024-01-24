import classNames from 'classnames';
import Container from '../Container';
import { CSSProperties, FC, ReactNode } from 'react';

interface IProps {
  className?: string;
  containerClassName?: string;
  style?: CSSProperties;
  children: ReactNode;
}

const Summary: FC<IProps> = ({
  className,
  containerClassName,
  style,
  children,
}) => {
  return (
    <div className={classNames(['summary', className])} style={style}>
      <Container
        size="middle"
        className={classNames(['summary__content', containerClassName])}
      >
        {children}
      </Container>
    </div>
  );
};

export default Summary;
