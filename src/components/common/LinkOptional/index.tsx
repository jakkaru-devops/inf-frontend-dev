import classNames from 'classnames';
import Link, { LinkProps } from 'next/link';
import { FC, ReactNode, MouseEvent as ReactMouseEvent } from 'react';

interface IProps extends Omit<LinkProps, 'href'> {
  href?: string;
  target?: '_self' | '_blank';
  className?: string;
  onClick?: (e: ReactMouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  children: ReactNode;
}

const LinkOptional: FC<IProps> = ({
  href,
  target,
  scroll = true,
  className,
  children,
  ...rest
}) => {
  if (!href) {
    return (
      <span className={classNames(['link', className])} {...rest}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      scroll={scroll}
      className={classNames(['link', className])}
      {...rest}
      target={target}
    >
      {children}
    </Link>
  );
};

export default LinkOptional;
