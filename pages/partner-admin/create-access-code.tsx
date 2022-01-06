import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { RootState } from '../../app/store';
import Header from '../../components/Header';
import { useTypedSelector } from '../../hooks/store';
import illustrationTeaPeach from '../../public/illustration_tea_peach.png';
import { rowStyle } from '../../styles/common';

const CreateAccessCode: NextPage = () => {
  const t = useTranslations('PartnerAdmin.createAccessCode');
  const tS = useTranslations('Shared');

  const { partner } = useTypedSelector((state: RootState) => state);

  const headerProps = {
    title: t.rich('title'),
    introduction: t.rich('introduction'),
    imageSrc: illustrationTeaPeach,
    imageAlt: 'alt.personTea',
  };

  const containerStyle = {
    backgroundColor: 'secondary.light',
    textAlign: 'center',
    ...rowStyle,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  } as const;

  return (
    <Box>
      <Head>
        <title>{t('title')}</title>
      </Head>
      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        imageAlt={headerProps.imageAlt}
      />
      <Container sx={containerStyle}></Container>
    </Box>
  );
};

export function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/partnerAdmin/${locale}.json`),
      },
    },
  };
}

export default CreateAccessCode;
