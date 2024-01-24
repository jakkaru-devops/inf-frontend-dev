import classNames from 'classnames';
import { Link } from 'components/common';
import { CSSProperties, FC, ReactNode } from 'react';

interface IProps {
  keyText: ReactNode;
  value: ReactNode;
  keyClassName?: string;
  valueClassName?: string;
  valueStyle?: CSSProperties;
  href?: string;
  hrefTarget?: '_self' | '_blank';
  onValueClick?: () => void;
  valueColor?: 'primary' | 'normal';
  inline?: boolean;
  className?: string;
  style?: CSSProperties;
  noColon?: boolean;
}

const KeyValueItem: FC<IProps> = ({
  keyText,
  value,
  keyClassName,
  valueClassName,
  valueStyle,
  href,
  hrefTarget,
  onValueClick,
  valueColor,
  inline = true,
  className,
  style,
  noColon,
}) => {
  const valueProps = {
    onClick: onValueClick,
    className: classNames(['key-value-item__value', valueClassName], {
      clickable: !!onValueClick || href,
      'color-primary': valueColor === 'primary',
      'color-normal': valueColor === 'normal',
    }),
    style: valueStyle,
  };

  return (
    <div
      className={classNames(['key-value-item', className], {
        inline,
      })}
      style={style}
    >
      <span className={classNames(['key-value-item__key', keyClassName])}>
        {keyText}
      </span>
      {!noColon && ': '}
      {!!href ? (
        <Link href={href} target={hrefTarget} {...valueProps}>
          {value}
        </Link>
      ) : (
        <span {...valueProps}>{value}</span>
      )}
    </div>
  );
};

export default KeyValueItem;
