'use client';

import PartnersTable from '@/components/admin/PartnersTable';
import CreatePartnerAdminForm from '@/components/forms/CreatePartnerAdminForm';
import DeleteCypressUsersForm from '@/components/forms/DeleteCypressUsersForm';
import UpdatePartnerAdminForm from '@/components/forms/UpdatePartnerAdminForm';
import UpdateTherapyAdminForm from '@/components/forms/UpdateTherapyAdminForm';
import AdminHeader from '@/components/layout/PartnerAdminHeader';
import { ADMIN_DASHBOARD_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import { CONTENT_MAX_WIDTH_WIDE } from '@/styles/common';
import { Box, Card, CardContent, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { ReactNode, useEffect } from 'react';

const containerStyle = {
  backgroundColor: 'secondary.light',
  paddingTop: { xs: 4, md: 6 },
} as const;

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
  gap: 3,
  maxWidth: CONTENT_MAX_WIDTH_WIDE,
  marginX: 'auto',
} as const;

const cardStyle = { marginTop: 0 } as const;
const wideCardStyle = { ...cardStyle, gridColumn: '1 / -1' } as const;
const dangerCardStyle = { ...cardStyle, border: 1, borderColor: 'error.main' } as const;

// globals.css zeroes the last paragraph's margin
const descriptionStyle = { '&:last-of-type': { marginBottom: 3 } } as const;

const AdminCard = ({
  title,
  description,
  sx = cardStyle,
  children,
}: {
  title: string;
  description?: string;
  sx?: object;
  children: ReactNode;
}) => (
  <Card sx={sx}>
    <CardContent>
      <Typography variant="h3" component="h2">
        {title}
      </Typography>
      {description && <Typography sx={descriptionStyle}>{description}</Typography>}
      {children}
    </CardContent>
  </Card>
);

export default function AdminDashboardPage() {
  const t = useTranslations('Admin');

  const userEmail = useTypedSelector((state) => state.user.email);
  const showDeleteCypressUsers = !!userEmail && userEmail.toLowerCase().includes('tech');

  useEffect(() => {
    logEvent(ADMIN_DASHBOARD_VIEWED);
  }, []);

  return (
    <Box>
      <AdminHeader title={t('title')} />
      <Container sx={containerStyle}>
        <Box sx={gridStyle}>
          <AdminCard
            title={t('partners.title')}
            description={t('partners.description')}
            sx={wideCardStyle}
          >
            <PartnersTable />
          </AdminCard>
          <AdminCard
            title={t('createPartnerAdmin.title')}
            description={t('createPartnerAdmin.description')}
          >
            <CreatePartnerAdminForm />
          </AdminCard>
          <AdminCard
            title={t('updatePartnerAdmin.title')}
            description={t('updatePartnerAdmin.description')}
          >
            <UpdatePartnerAdminForm />
          </AdminCard>
          <AdminCard title={t('updateTherapy.title')} description={t('updateTherapy.description')}>
            <UpdateTherapyAdminForm />
          </AdminCard>
          {showDeleteCypressUsers && (
            <AdminCard title={t('deleteCypressUsers.title')} sx={dangerCardStyle}>
              <DeleteCypressUsersForm />
            </AdminCard>
          )}
        </Box>
      </Container>
    </Box>
  );
}
