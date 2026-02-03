import { format } from 'date-fns';
import api from '@/api/axios';
import type {
  DetalleAuditoria,
  KpiStats,
  PagedResponse,
  ProductoPerformance,
  VentaDiaria,
} from '@/types/dashboard';

const toDateParam = (date: Date) => format(date, 'yyyy-MM-dd');

const buildParams = (from: Date, to: Date, supervisorId?: number | null) => {
  const params: Record<string, string | number> = {
    from: toDateParam(from),
    to: toDateParam(to),
  };

  if (typeof supervisorId === 'number') {
    params.supervisorId = supervisorId;
  }

  return params;
};

export const dashboardService = {
  async getKpiStats(from: Date, to: Date, supervisorId?: number | null) {
    const { data } = await api.get<KpiStats>('/dashboard/stats', {
      params: buildParams(from, to, supervisorId),
    });
    return data;
  },

  async getTrend(from: Date, to: Date, supervisorId?: number | null) {
    const { data } = await api.get<VentaDiaria[]>('/dashboard/trend', {
      params: buildParams(from, to, supervisorId),
    });
    return data;
  },

  async getProductMix(from: Date, to: Date, supervisorId?: number | null) {
    const { data } = await api.get<ProductoPerformance[]>(
      '/dashboard/product-mix',
      {
        params: buildParams(from, to, supervisorId),
      }
    );
    return data;
  },

  async getAuditReport(
    from: Date,
    to: Date,
    page: number,
    size: number,
    supervisorId?: number | null
  ) {
    const { data } = await api.get<PagedResponse<DetalleAuditoria>>(
      '/dashboard/audit-report',
      {
        params: {
          ...buildParams(from, to, supervisorId),
          page,
          size,
        },
      }
    );
    return data;
  },
};
