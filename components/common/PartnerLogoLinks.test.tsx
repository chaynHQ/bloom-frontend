import { launchedPartners, launchedPartnersWithBff } from '@/lib/partners/partnerFixtures';
import { fireEvent, render, screen, within } from '@testing-library/react';
import PartnerLogoLinks from './PartnerLogoLinks';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values: { name: string }) =>
    key === 'alt.partnerLogo' ? `${values.name} logo` : key,
}));
jest.mock('@/i18n/routing', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const href = (slug: string) => `/welcome/${slug}`;

describe('PartnerLogoLinks', () => {
  it('links each partner’s logo to its welcome page', () => {
    render(<PartnerLogoLinks partners={launchedPartners} href={href} />);

    expect(screen.getByRole('link', { name: 'Bumble logo' }).getAttribute('href')).toBe(
      '/welcome/bumble',
    );
    expect(screen.getByRole('link', { name: 'Badoo logo' }).getAttribute('href')).toBe(
      '/welcome/badoo',
    );
    expect(screen.queryByRole('link', { name: 'Bumble' })).toBeNull();
  });

  it('shows a shared logo once, with each partner of the brand named', () => {
    render(<PartnerLogoLinks partners={launchedPartnersWithBff} href={href} />);

    expect(screen.getAllByRole('img')).toHaveLength(2);
    const bumbleBrand = screen.getByRole('img', { name: 'Bumble logo' }).closest('li')!;
    const names = within(within(bumbleBrand).getByRole('list')).getAllByRole('link');
    expect(names.map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
      ['Bumble', '/welcome/bumble'],
      ['Bumble For Friends', '/welcome/bff'],
    ]);
    expect(screen.getByRole('link', { name: 'Bumble logo' }).getAttribute('tabindex')).toBe('-1');
  });

  it('reports the partner a visitor picked', () => {
    const onPartnerClick = jest.fn();
    render(
      <PartnerLogoLinks
        partners={launchedPartnersWithBff}
        href={href}
        onPartnerClick={onPartnerClick}
      />,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Bumble For Friends' }));
    expect(onPartnerClick).toHaveBeenCalledWith('bff');
  });
});
