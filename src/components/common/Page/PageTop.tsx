import { CSSProperties, FC, ReactNode } from 'react';
import { Container } from 'components/common';
import { IContainerProps } from '../Container/interfaces';

interface IProps {
  title?: string | ReactNode;
  colLeft?: ReactNode;
  colRight?: ReactNode;
  containerProps?: IContainerProps;
  style?: CSSProperties;
}

const PageTop: FC<IProps> = ({
  title,
  colLeft,
  colRight,
  containerProps,
  style,
}) => {
  return (
    <Container
      size="middle"
      {...containerProps}
      className="app-page__top d-flex justify-content-between align-items-center"
      style={style}
    >
      <div className="row">
        <div className="col w-100">
          {colLeft ||
            (title && (typeof title === 'string' ? <h2>{title}</h2> : title))}
        </div>

        {!!colRight && (
          <div className="col w-100 d-flex justify-content-end align-items-center">
            {colRight}
          </div>
        )}
      </div>
    </Container>
  );
};

export default PageTop;
