import { useAddPartnerAccessMutation } from '@/lib/api';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CreateAccessCodeForm from './CreateAccessCodeForm';

// next-intl and its formatter ship ESM only, so this formats the real English messages with
// just what they use: {value}, a one/other plural, and rich tags
jest.mock('next-intl', () => {
  const { createElement, Fragment } = require('react');
  const messages = require('@/i18n/messages/partnerAdmin/en.json');
  const format = (message: string, values: Record<string, any> = {}) => {
    const text = message
      .replace(/\{(\w+), plural, one \{([^}]*)\} other \{([^}]*)\}\}/g, (_, name, one, other) =>
        (values[name] === 1 ? one : other).replace('#', String(values[name])),
      )
      .replace(/\{(\w+)\}/g, (_, name) => String(values[name]));
    const parts = text.split(/<(\w+)>(.*?)<\/\1>/);
    if (parts.length === 1) return text;
    return parts.map((part, i) =>
      createElement(
        Fragment,
        { key: i },
        i % 3 === 1 ? values[part](parts[i + 1]) : i % 3 === 0 ? part : null,
      ),
    );
  };
  return {
    useTranslations: (namespace: string) => {
      const lookup = (key: string, values?: Record<string, any>) => {
        const path = `${namespace}.${key}`.split('.');
        const message = path.reduce((node: any, part) => node?.[part], messages);
        if (typeof message !== 'string') throw new Error(`Missing message ${path.join('.')}`);
        return format(message, values);
      };
      return Object.assign(lookup, { rich: lookup });
    },
  };
});
jest.mock('@/lib/api', () => ({ useAddPartnerAccessMutation: jest.fn() }));
let mockPartner: Record<string, unknown>;
jest.mock('@/lib/hooks/store', () => ({
  useTypedSelector: (selector: (state: unknown) => unknown) =>
    selector({ partnerAdmin: { partner: mockPartner } }),
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

const badoo = {
  id: 'badoo',
  name: 'Badoo',
  slug: 'badoo',
  isActive: true,
  therapySessionsPerCode: 6,
  partnerFeature: [],
};
// Its slug differs from its name, and it offers no therapy
const bumbleForFriends = {
  id: 'bff',
  name: 'Bumble For Friends',
  slug: 'bumble-for-friends',
  isActive: true,
  therapySessionsPerCode: 0,
  partnerFeature: [],
};

const addPartnerAccess = jest.fn();

const createCode = async () => {
  fireEvent.click(screen.getByRole('radio'));
  fireEvent.click(screen.getByRole('button', { name: 'Create access codes' }));
  await waitFor(() => expect(addPartnerAccess).toHaveBeenCalledTimes(1));
};

describe('CreateAccessCodeForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    addPartnerAccess.mockResolvedValue({ data: { accessCode: 'ABC123' } });
    (useAddPartnerAccessMutation as jest.Mock).mockReturnValue([addPartnerAccess]);
  });

  it("offers therapy with the partner's limit, saying how many sessions", async () => {
    mockPartner = badoo;
    render(<CreateAccessCodeForm />);

    const option = screen.getByRole('radio', {
      name: 'Courses, messaging and 6 therapy sessions',
    }) as HTMLInputElement;
    expect(option.value).toBe('therapy');

    await createCode();
    expect(addPartnerAccess).toHaveBeenCalledWith({
      featureLiveChat: true,
      featureTherapy: true,
      therapySessionsRemaining: 6,
      therapySessionsRedeemed: 0,
    });
  });

  it('hides therapy when the limit is 0, offering courses and messaging', async () => {
    mockPartner = bumbleForFriends;
    render(<CreateAccessCodeForm />);

    expect(screen.getAllByRole('radio')).toHaveLength(1);
    expect(screen.queryByText(/therapy/i)).toBeNull();
    expect(screen.getByRole('radio', { name: 'Courses and messaging' })).toBeTruthy();

    await createCode();
    expect(addPartnerAccess).toHaveBeenCalledWith({
      featureLiveChat: true,
      featureTherapy: false,
      therapySessionsRemaining: 0,
      therapySessionsRedeemed: 0,
    });
  });

  it('builds the welcome link from the slug', async () => {
    mockPartner = bumbleForFriends;
    render(<CreateAccessCodeForm />);

    await createCode();

    const link = await screen.findByRole('link');
    expect(link.getAttribute('href')).toMatch(/\/welcome\/bumble-for-friends$/);
    expect(screen.getByText('ABC123')).toBeTruthy();
  });
});
