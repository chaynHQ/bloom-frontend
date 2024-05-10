import { JSXElementConstructor, ReactElement, ReactNode, useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import ProfileDetailsForm from '../../components/forms/ProfileDetailsForm';
import { useUpdateUserMutation } from '../../app/api';
import Link from '../../components/common/Link';
import { rowStyle } from '../../styles/common';
import Header from '../../components/layout/Header';
import { USER_DISABLED_SERVICE_EMAILS } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import illustrationPerson5Yellow from '../../public/notes_from_bloom_icon.svg';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import AccountActions from '../../components/account/AccountActions';
import EmailPref from '../../components/account/EmailPref';

const containerStyle = {
  ...rowStyle,
  backgroundColor: 'secondary.light',
} as const;

const formCardStyle = {
  width: { xs: '100%', sm: '70%', md: '45%' },
  alignSelf: 'flex-start',
} as const;

const AccountSettings: NextPage = () => {
  const t = useTranslations('Account.accountSettings');

  const userServiceEmailsPermission = useTypedSelector(
    (state) => state.user.serviceEmailsPermission,
  );
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);
  const [error, setError] = useState<
    string | ReactElement<any, string | JSXElementConstructor<any>> | ReactNode | null
  >();
  const [updateUser, { isLoading: updateUserIsLoading }] = useUpdateUserMutation();

  useEffect(() => {
    if (userCreatedAt && userServiceEmailsPermission === true) {
      try {
        updateUser({ serviceEmailsPermission: false });
        logEvent(USER_DISABLED_SERVICE_EMAILS, eventUserData);
      } catch (error) {
        setError(
          t.rich('error', {
            link: (content) => (
              <Link href={process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL || '#'}>{content}</Link>
            ),
          }),
        );
      }
    }
  }, []);

  const headerProps = {
    title: t('title'),
    introduction: t.rich('description', {
      link: (content) => (
        <Link href={process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL || '#'}>{content}</Link>
      ),
    }),
    imageSrc: illustrationPerson5Yellow,
    translatedImageAlt: t('imageAlt'),
  };

  return (
    <Box>
      <Head>
        <title>{t('title')}</title>
      </Head>
      {error && (
        <Container>
          <Typography>{error}</Typography>
        </Container>
      )}
      {!error && !updateUserIsLoading && (
        <Header
          title={headerProps.title}
          introduction={headerProps.introduction}
          imageSrc={headerProps.imageSrc}
          translatedImageAlt={headerProps.translatedImageAlt}
        />
      )}


      <Container sx={containerStyle}>
        <Card sx={formCardStyle}>
          <CardContent>
            <Typography variant="h2" component="h2">
              {t('profile.title')}
            </Typography>
            <Typography fontSize="1rem !important">
              {t('profile.desc')}
            </Typography>
            <ProfileDetailsForm />
          </CardContent>
        </Card>

        <AccountActions />
        <EmailPref />
      </Container>
    </Box>
  );
};

export function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/account/${locale}.json`),
      },
    },
  };
}

export default AccountSettings;
