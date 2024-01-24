import classNames from 'classnames';
import { IComponentCommonProps } from 'interfaces/common.interfaces';
import { FC } from 'react';

interface IProps extends IComponentCommonProps {
  isRequired?: boolean;
  title?: string | JSX.Element;
  layout?: 'horizontal' | 'vertical';
  size?: 'small' | 'default';
}

const FormGroup: FC<IProps> = ({
  isRequired,
  title,
  layout = 'vertical',
  style,
  className,
  size = 'default',
  children,
}) => {
  return (
    <div
      className={classNames(['form-group ant-row ant-form-item', className], {
        'vertical-layout': layout === 'vertical',
        'small-size': (size = 'small'),
      })}
      style={style}
    >
      {title && (
        <div className="ant-form-item-label">
          <label
            className={classNames({
              'ant-form-item-required': isRequired,
            })}
          >
            {title}
          </label>
        </div>
      )}
      <div className="ant-form-item-control">{children}</div>
    </div>
  );
};

export default FormGroup;
