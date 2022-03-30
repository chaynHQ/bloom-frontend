import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Image from 'next/image';
import illustrationPerson4Peach from '../../public/illustration_person4_peach.svg';
import { columnStyle } from '../../styles/common';

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

export const ContentUnavailable = () => {
  return (
    <Container sx={accessContainerStyle}>
      <Box sx={imageContainerStyle}>
        <Image
          alt={'alt.personTea'}
          src={illustrationPerson4Peach}
          layout="fill"
          objectFit="contain"
        />
      </Box>
      {/* TODO add message  */}
    </Container>
  );
};
