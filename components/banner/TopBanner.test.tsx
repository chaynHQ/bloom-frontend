import { PARTNER_SURVEY_BANNER_CLICKED, REDESIGN_BANNER_VIEWED } from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import { fireEvent, render, screen } from '@testing-library/react';
import Cookies from 'js-cookie';
import TopBanner from './TopBanner';

// next-intl ships ESM only, so this formats the real English messages with just what they use:
// {value} and a <strong> rich tag
jest.mock('next-intl', () => {
  const { createElement, Fragment } = require('react');
  const messages = require('@/i18n/messages/navigation/en.json');
  const format = (message: string, values: Record<string, any> = {}) => {
    const text = message.replace(/\{(\w+)\}/g, (_, name) => String(values[name]));
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
    useLocale: () => mockLocale,
    useTranslations: (namespace: string) => {
      const lookup = (key: string, values?: Record<string, any>) => {
        const message = messages[namespace]?.[key];
        if (typeof message !== 'string') throw new Error(`Missing message ${namespace}.${key}`);
        return format(message, values);
      };
      return Object.assign(lookup, { rich: lookup });
    },
  };
});

let mockLocale = 'en';
let mockState: Record<string, unknown>;
jest.mock('@/lib/hooks/store', () => ({
  useTypedSelector: (selector: (state: unknown) => unknown) => selector(mockState),
}));
jest.mock('@/lib/hooks/useTopBannerHeight', () => ({ useTopBannerHeight: jest.fn() }));
jest.mock('@/lib/utils/logEvent', () => jest.fn());

const loadedUser = { authStateLoading: false, loading: false, token: 'token', id: 'user-id' };
const memberOf = (...names: string[]) =>
  names.map((name) => ({ partner: { name } }) as { partner: { name: string } });

const setState = (partnerAccesses: { partner: { name: string } }[], user = loadedUser) => {
  mockState = { partnerAccesses, user };
};

const surveyLink = () => screen.queryByRole('link', { name: 'Take survey' });
const redesignLink = () => screen.queryByRole('link', { name: 'Share feedback Feedback' });

describe('TopBanner', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_FF_PARTNER_SURVEY_BANNER = 'true';
    process.env.NEXT_PUBLIC_FF_REDESIGN_NEWS_BANNER = 'true';
    mockLocale = 'en';
    Object.keys(Cookies.get()).forEach((name) => Cookies.remove(name));
    jest.mocked(logEvent).mockClear();
  });

  it('shows Bumble members the Bumble survey instead of the redesign news', () => {
    setState(memberOf('Bumble'));
    render(<TopBanner />);

    expect(screen.getByRole('complementary', { name: 'Bumble x Bloom survey' })).toBeTruthy();
    expect(screen.getByText('Bumble x Bloom partnership').tagName).toBe('STRONG');
    expect(surveyLink()?.getAttribute('href')).toBe('https://form.typeform.com/to/o38bzFOL');
    expect(surveyLink()?.getAttribute('target')).toBe('_blank');
    expect(redesignLink()).toBeNull();
  });

  it('shows Badoo members the Badoo survey', () => {
    setState(memberOf('Badoo'));
    render(<TopBanner />);

    expect(screen.getByText('Badoo x Bloom partnership')).toBeTruthy();
    expect(surveyLink()?.getAttribute('href')).toBe('https://form.typeform.com/to/cjtDVKyF');
  });

  it('shows the redesign news to members of other partners and to signed-out visitors', () => {
    setState(memberOf('Bumble For Friends'));
    const { unmount } = render(<TopBanner />);
    expect(surveyLink()).toBeNull();
    expect(redesignLink()).toBeTruthy();
    unmount();

    setState([], { authStateLoading: false, loading: false, token: null, id: null } as never);
    render(<TopBanner />);
    expect(redesignLink()).toBeTruthy();
  });

  it('keeps the redesign news outside English, as the surveys are in English only', () => {
    mockLocale = 'fr';
    setState(memberOf('Bumble'));
    render(<TopBanner />);

    expect(surveyLink()).toBeNull();
  });

  it('keeps the redesign news when the survey flag is off', () => {
    process.env.NEXT_PUBLIC_FF_PARTNER_SURVEY_BANNER = '';
    setState(memberOf('Badoo'));
    render(<TopBanner />);

    expect(surveyLink()).toBeNull();
    expect(redesignLink()).toBeTruthy();
  });

  it('records the survey click against the partner and does not show the banner again', () => {
    setState(memberOf('Bumble'));
    render(<TopBanner />);

    fireEvent.click(surveyLink()!);

    expect(logEvent).toHaveBeenCalledWith(PARTNER_SURVEY_BANNER_CLICKED, { partner: 'Bumble' });
    expect(Cookies.get('partner_survey_2026_banner_interacted')).toBe('true');
  });

  it('only counts the redesign news as viewed once the user has loaded', () => {
    setState([], { ...loadedUser, id: null } as never);
    const { rerender } = render(<TopBanner />);
    expect(logEvent).not.toHaveBeenCalledWith(REDESIGN_BANNER_VIEWED, undefined);

    setState([]);
    rerender(<TopBanner />);
    expect(logEvent).toHaveBeenCalledWith(REDESIGN_BANNER_VIEWED, undefined);
  });
});
