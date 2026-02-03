import * as React from 'react';
import { subDays } from 'date-fns';

type DateRange = {
  from: Date;
  to: Date;
};

interface DashboardContextValue {
  dateRange: DateRange;
  supervisorId: number | null;
  setDateRange: (range: DateRange) => void;
  setSupervisorId: (id: number | null) => void;
}

const DashboardContext = React.createContext<DashboardContextValue | undefined>(
  undefined
);

const createDefaultRange = (): DateRange => {
  const today = new Date();
  return {
    from: subDays(today, 6),
    to: today,
  };
};

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [dateRange, setDateRange] = React.useState<DateRange>(
    createDefaultRange
  );
  const [supervisorId, setSupervisorId] = React.useState<number | null>(null);

  const value = React.useMemo(
    () => ({
      dateRange,
      supervisorId,
      setDateRange,
      setSupervisorId,
    }),
    [dateRange, supervisorId]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardFilters() {
  const context = React.useContext(DashboardContext);
  if (!context) {
    throw new Error(
      'useDashboardFilters debe usarse dentro de DashboardProvider.'
    );
  }
  return context;
}

export type { DateRange };
