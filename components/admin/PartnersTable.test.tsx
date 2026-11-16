import { revalidatePartners } from '@/lib/actions/revalidatePartners';
import { useGetPartnersQuery, useUpdatePartnerMutation } from '@/lib/api';
import { AdminPartner } from '@/lib/store/partnersSlice';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import PartnersTable from './PartnersTable';

// next-intl ships ESM only, so this looks keys up in the real English messages instead
jest.mock('next-intl', () => ({
  useTranslations:
    (namespace: string) =>
    (key: string, values: Record<string, string> = {}) => {
      const path = `${namespace}.${key}`.split('.');
      const message = path.reduce<any>(
        (node, part) => node?.[part],
        require('@/i18n/messages/admin/en.json'),
      );
      if (typeof message !== 'string') throw new Error(`Missing message ${path.join('.')}`);
      return message.replace(/\{(\w+)\}/g, (_, name) => values[name]);
    },
}));
jest.mock('@/lib/api', () => ({
  useGetPartnersQuery: jest.fn(),
  useUpdatePartnerMutation: jest.fn(),
}));
jest.mock('@/lib/actions/revalidatePartners', () => ({ revalidatePartners: jest.fn() }));
jest.mock('@/lib/hooks/store', () => ({
  useTypedSelector: (selector: (state: unknown) => unknown) =>
    selector({ user: { token: 'super-admin-token' } }),
}));
jest.mock('@/i18n/routing', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
jest.mock('@rollbar/react', () => ({ useRollbar: () => ({ error: jest.fn() }) }));
jest.mock('@/lib/utils/logEvent', () => jest.fn());

const partner = (overrides: Partial<AdminPartner>): AdminPartner => ({
  id: 'id',
  name: 'Name',
  slug: 'name',
  storyblokUuid: null,
  isActive: true,
  therapySessionsPerCode: 0,
  automaticAccessCode: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

// Bumble For Friends' slug differs from its name; Fruitz is inactive here to cover activation.
const partners = [
  partner({ id: 'badoo', name: 'Badoo', slug: 'badoo', therapySessionsPerCode: 6 }),
  partner({ id: 'bumble', name: 'Bumble', slug: 'bumble', therapySessionsPerCode: 6 }),
  partner({
    id: 'bff',
    name: 'Bumble For Friends',
    slug: 'bumble-for-friends',
    therapySessionsPerCode: 0,
    automaticAccessCode: true,
  }),
  partner({ id: 'fruitz', name: 'Fruitz', slug: 'fruitz', isActive: false }),
];

const updatePartner = jest.fn();

const renderTable = () => render(<PartnersTable />);

const row = (slug: string) => screen.getByText(slug, { selector: 'td *' }).closest('tr')!;

describe('PartnersTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useGetPartnersQuery as jest.Mock).mockReturnValue({ data: partners, isLoading: false });
    updatePartner.mockResolvedValue({ data: {} });
    (useUpdatePartnerMutation as jest.Mock).mockReturnValue([updatePartner]);
    (revalidatePartners as jest.Mock).mockResolvedValue(undefined);
  });

  it('lists every partner with its slug, status and welcome page link', () => {
    renderTable();

    const bff = row('bumble-for-friends');
    expect(within(bff).getByText('Bumble For Friends')).toBeTruthy();
    expect(within(bff).getByText('Active')).toBeTruthy();
    expect(within(bff).getByRole('link').getAttribute('href')).toBe('/welcome/bumble-for-friends');
    expect(within(row('fruitz')).getByText('Inactive')).toBeTruthy();
  });

  it('offers a therapy limit from 0 to 20', () => {
    renderTable();

    const select = within(row('badoo')).getByRole('combobox');
    const values = within(select)
      .getAllByRole('option')
      .map((option) => (option as HTMLOptionElement).value);
    expect(values).toEqual(Array.from({ length: 21 }, (_, i) => String(i)));
    expect((select as HTMLSelectElement).value).toBe('6');
  });

  it('changing the therapy limit sends only the limit', async () => {
    renderTable();

    fireEvent.change(within(row('badoo')).getByRole('combobox'), {
      target: { value: '3' },
    });

    await waitFor(() => expect(updatePartner).toHaveBeenCalledTimes(1));
    expect(updatePartner).toHaveBeenCalledWith({ id: 'badoo', therapySessionsPerCode: 3 });
  });

  it('toggling the automatic access code sends only that field', async () => {
    renderTable();

    fireEvent.click(within(row('bumble-for-friends')).getByRole('switch'));

    await waitFor(() => expect(updatePartner).toHaveBeenCalledTimes(1));
    expect(updatePartner).toHaveBeenCalledWith({ id: 'bff', automaticAccessCode: false });
  });

  it('deactivating asks for confirmation first, then sends only active', async () => {
    renderTable();

    fireEvent.click(within(row('badoo')).getByRole('button', { name: 'Deactivate' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toMatch(/admins/);
    expect(dialog.textContent).toMatch(/every member/);
    expect(updatePartner).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Deactivate' }));

    await waitFor(() => expect(updatePartner).toHaveBeenCalledTimes(1));
    expect(updatePartner).toHaveBeenCalledWith({ id: 'badoo', active: false });
  });

  it('cancelling the confirmation sends nothing', () => {
    renderTable();

    fireEvent.click(within(row('badoo')).getByRole('button', { name: 'Deactivate' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }));

    expect(updatePartner).not.toHaveBeenCalled();
  });

  it('activating sends only active', async () => {
    renderTable();

    fireEvent.click(within(row('fruitz')).getByRole('button', { name: 'Activate' }));

    await waitFor(() => expect(updatePartner).toHaveBeenCalledTimes(1));
    expect(updatePartner).toHaveBeenCalledWith({ id: 'fruitz', active: true });
  });

  it('disables every control while an update is in flight', async () => {
    updatePartner.mockReturnValue(new Promise(() => {}));
    renderTable();

    fireEvent.click(within(row('bumble-for-friends')).getByRole('switch'));

    await waitFor(() =>
      expect(within(row('badoo')).getByRole('combobox').hasAttribute('disabled')).toBe(true),
    );
    expect(within(row('badoo')).getByRole('switch').hasAttribute('disabled')).toBe(true);
    expect(
      within(row('fruitz')).getByRole('button', { name: 'Activate' }).hasAttribute('disabled'),
    ).toBe(true);
  });

  it("revalidates the site's partners after a successful update", async () => {
    renderTable();

    fireEvent.click(within(row('bumble-for-friends')).getByRole('switch'));

    await waitFor(() => expect(revalidatePartners).toHaveBeenCalledWith('super-admin-token'));
  });

  it('does not revalidate when the update fails, and shows the error', async () => {
    updatePartner.mockResolvedValue({ error: { status: 400, data: { message: 'Bad request' } } });
    renderTable();

    fireEvent.click(within(row('bumble-for-friends')).getByRole('switch'));

    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toMatch(/Bumble For Friends/),
    );
    expect(revalidatePartners).not.toHaveBeenCalled();
  });
});
