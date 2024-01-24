import { CSSProperties, FC, ReactNode } from 'react';
import NextLink, { LinkProps } from 'next/link';

interface IProps extends LinkProps {
  target?: '_self' | '_blank';
  scroll?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  rel?: 'noopener';
  download?: string;
  title?: string;
}

const Link: FC<IProps> = ({ href, target, scroll, children, ...rest }) => {
  if (!href) {
    return <></>;
    // return <a {...rest} target={target} className="no-link" />;
  }

  scroll = typeof scroll !== 'undefined' ? scroll : true;

  return (
    <NextLink href={href} scroll={scroll} target={target} {...rest}>
      {children}
    </NextLink>
  );
};

export default Link;
