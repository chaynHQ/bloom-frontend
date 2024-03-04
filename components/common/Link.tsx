import OpenInNew from '@mui/icons-material/OpenInNew';
import MuiLink, { LinkProps as MuiLinkProps } from '@mui/material/Link';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

// Add support for the sx prop for consistency with the other branches.
const Anchor = styled('a')({});

interface NextLinkComposedProps
  extends Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      'href' | 'onClick' | 'onMouseEnter' | 'onTouchStart'
    >,
    Omit<NextLinkProps, 'href' | 'as' | 'onClick' | 'onMouseEnter' | 'onTouchStart'> {
  to: NextLinkProps['href'];
  linkAs?: NextLinkProps['as'];
  href?: NextLinkProps['href'];
  onClick?: NextLinkProps['onClick'];
  onMouseEnter?: NextLinkProps['onMouseEnter'];
  onTouchStart?: NextLinkProps['onTouchStart'];
}

export const NextLinkComposed = React.forwardRef<HTMLAnchorElement, NextLinkComposedProps>(
  function NextLinkComposed(props, ref) {
    const { to, linkAs, href, replace, scroll, shallow, prefetch, locale, ...other } = props;

    return (
      <NextLink
        href={to}
        prefetch={prefetch}
        as={linkAs}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        passHref
        locale={locale}
        ref={ref}
        {...other}
      />
    );
  },
);

export type LinkProps = {
  activeClassName?: string;
  as?: NextLinkProps['as'];
  href: NextLinkProps['href'];
  unstyled?: boolean;
} & Omit<NextLinkComposedProps, 'to' | 'linkAs' | 'href'> &
  Omit<MuiLinkProps, 'href'>;

// A styled version of the Next.js Link component:
// https://nextjs.org/docs/#with-link
const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  const {
    activeClassName = 'active',
    as: linkAs,
    className: classNameProps,
    href,
    unstyled,
    role, // Link don't have roles.
    ...other
  } = props;

  const router = useRouter();
  const pathname = typeof href === 'string' ? href : href.pathname;
  const className = clsx(classNameProps, {
    [activeClassName]: router.pathname === pathname && activeClassName,
  });

  const isExternal =
    typeof href === 'string' && (href.indexOf('http') === 0 || href.indexOf('mailto:') === 0);

  if (isExternal) {
    const hasImageElements = React.Children.toArray(other.children).find((child) => {
      if (typeof child === 'string' || typeof child === 'number' || Array.isArray(child))
        return false;

      child = child as React.ReactElement;

      const elementType = typeof child.type === 'string' ? child.type : child.type.name;
      return elementType === 'Image';
    });

    if (unstyled) {
      return (
        <Anchor className={className} href={href} ref={ref} {...other}>
          {!hasImageElements && <OpenInNew fontSize="small" sx={{ mb: -0.5, mr: 0.3 }} />}
          {other.children}
        </Anchor>
      );
    }

    return (
      <MuiLink className={className} href={href} ref={ref} {...other}>
        {!hasImageElements && <OpenInNew fontSize="small" sx={{ mb: -0.5, mr: 0.3 }} />}
        {other.children}
      </MuiLink>
    );
  }

  if (unstyled) {
    return <NextLinkComposed className={className} ref={ref} to={href} {...other} />;
  }

  return (
    <MuiLink
      component={NextLinkComposed}
      linkAs={linkAs}
      passHref={true}
      className={className}
      ref={ref}
      to={href}
      {...other}
    />
  );
});

export default Link;
