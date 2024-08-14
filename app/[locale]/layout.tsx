import { locales } from '../../i18n/config';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export async function generateStaticParams() {
  return locales.map((locale) => {
    return { params: { locale } };
  });
}

export default Layout;
