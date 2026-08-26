import { CalendarDays } from "lucide-react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const createDefaultSchedule = () => days.map((day) => ({
  day,
  isAvailable: !["Thursday", "Sunday"].includes(day),
  shifts: [{ startTime: "09:00", endTime: "17:00" }],
}));

export const ScheduleEditor = ({ schedule, setSchedule }) => {
  const updateDay = (index, changes) => setSchedule((current) => current.map((day, i) => i === index ? { ...day, ...changes } : day));
  const updateShift = (dayIndex, shiftIndex, changes) => setSchedule((current) => current.map((day, i) => i === dayIndex ? { ...day, shifts: day.shifts.map((shift, j) => j === shiftIndex ? { ...shift, ...changes } : shift) } : day));

  return <div className="space-y-2"><p className="mb-4 rounded-xl bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-700">Set the days and time slots when the doctor is available.</p>{schedule.map((day, dayIndex) => <div key={day.day} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"><div className="flex flex-wrap items-center gap-4"><label className="flex w-32 items-center gap-2 text-sm font-bold text-slate-800"><input type="checkbox" checked={day.isAvailable} onChange={(event) => updateDay(dayIndex, { isAvailable: event.target.checked })} />{day.day}</label>{day.isAvailable ? <div className="flex flex-1 flex-wrap items-center gap-3">{day.shifts.map((shift, shiftIndex) => <div key={shiftIndex} className="flex items-center gap-2"><span className="text-xs font-semibold text-slate-500">From</span><input type="time" value={shift.startTime} onChange={(event) => updateShift(dayIndex, shiftIndex, { startTime: event.target.value })} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold" /><span className="text-xs font-bold text-slate-400">to</span><input type="time" value={shift.endTime} onChange={(event) => updateShift(dayIndex, shiftIndex, { endTime: event.target.value })} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold" /></div>)}<button type="button" onClick={() => updateDay(dayIndex, { shifts: [...day.shifts, { startTime: "18:00", endTime: "20:00" }] })} className="cursor-pointer text-xs font-bold text-blue-600">+ Add Slot</button></div> : <span className="text-xs font-semibold text-slate-400">Not available</span>}</div></div>)}</div>;
};
