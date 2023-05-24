import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import illustrationPerson4Peach from '../../public/illustration_person4_peach.svg';
import { columnStyle } from '../../styles/common';
import { TextNode } from '../../utils/helper-types/translations';

const accessContainerStyle = {
  ...columnStyle,
  height: '100vh',
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 150, md: 210 },
  height: { xs: 150, md: 210 },
  marginBottom: 4,
} as const;

interface ContentUnavailableProps {
  title: string;
  message: TextNode;
}

export const ContentUnavailable = ({ title, message }: ContentUnavailableProps) => {
  const t = useTranslations('Shared');

  return (
    <Container sx={accessContainerStyle}>
      <Box sx={imageContainerStyle}>
        <Image
          alt={t('alt.personTea')}
          src={illustrationPerson4Peach}
          layout="fill"
          objectFit="contain"
        />
      </Box>
      <Typography variant="h2" component="h2" mb={2}>
        {title}
      </Typography>
      <Typography mb={2}>{message}</Typography>
    </Container>
  );
};
