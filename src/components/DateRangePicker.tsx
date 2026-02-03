import { format, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useDashboardFilters } from '../context/DashboardContext';

const formatInputDate = (date: Date) => format(date, 'yyyy-MM-dd');

export default function DateRangePicker() {
  const { dateRange, setDateRange } = useDashboardFilters();

  const handleFromChange = (value: string) => {
    if (!value) return;
    const newFrom = parseISO(value);
    const nextTo = newFrom > dateRange.to ? newFrom : dateRange.to;
    setDateRange({ from: newFrom, to: nextTo });
  };

  const handleToChange = (value: string) => {
    if (!value) return;
    const newTo = parseISO(value);
    const nextFrom = newTo < dateRange.from ? newTo : dateRange.from;
    setDateRange({ from: nextFrom, to: newTo });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-600">Desde</span>
        <Input
          type="date"
          value={formatInputDate(dateRange.from)}
          onChange={(event) => handleFromChange(event.target.value)}
          className="w-40"
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-600">Hasta</span>
        <Input
          type="date"
          value={formatInputDate(dateRange.to)}
          onChange={(event) => handleToChange(event.target.value)}
          className="w-40"
        />
      </div>
    </div>
  );
}
