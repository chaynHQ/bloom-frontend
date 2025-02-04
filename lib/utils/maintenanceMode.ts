import { MAINTENANCE_MODE } from '@/lib/constants/enums';

export const getIsMaintenanceMode = () => {
  return process.env.NEXT_PUBLIC_MAINTENANCE_MODE === MAINTENANCE_MODE.ON;
};
