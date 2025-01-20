import { Box, Container, Typography } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from '../../components/common/Link';
import Header from '../../components/layout/Header';
import { ErrorDisplay } from '../../constants/common';
import { USER_DISABLED_SERVICE_EMAILS } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import illustrationPerson5Yellow from '../../public/illustration_leaf_mix_bee.svg';
import { useUpdateUserMutation } from '../../store/api';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const DisableServiceEmails: NextPage = () => {
  const t = useTranslations('Account.disableServiceEmails');

  const userServiceEmailsPermission = useTypedSelector(
    (state) => state.user.serviceEmailsPermission,
  );
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);
  const [error, setError] = useState<ErrorDisplay>();
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
        <title>{`${t('title')} • Bloom`}</title>
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

export default DisableServiceEmails;
