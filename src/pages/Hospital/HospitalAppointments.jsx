import { useEffect, useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  MoreVertical,
  Search,
  XCircle,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import {
  GetHospitalAppointments,
  UpdateHospitalAppointmentStatus,
} from "../../api/appointmentApi.js";

const timeText = (value) =>
  new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

export const HospitalAppointments = () => {
  const { setHeaderContent } = useOutletContext();
  const [summary, setSummary] = useState({
    today: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dateRange, setDateRange] = useState("today");
  const [openMenu, setOpenMenu] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  useEffect(() => {
    setHeaderContent({
      title: "Appointments",
      subtitle: "Manage and monitor today's appointments",
      action: undefined,
    });
  }, [setHeaderContent]);
  useEffect(() => {
    const loadAppointments = async () => {
      try {
            const response = await GetHospitalAppointments(dateRange);
        setSummary(
          response?.summary || {
            today: 0,
            upcoming: 0,
            completed: 0,
            cancelled: 0,
          },
        );
        setAppointments(response?.appointments || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load appointments.");
      } finally {
        setLoading(false);
      }
    };
    loadAppointments();
      }, [dateRange]);
  const changeStatus = async (appointmentId, status) => {
    setUpdatingId(appointmentId);
    setOpenMenu(null);
    try {
      await UpdateHospitalAppointmentStatus(appointmentId, status);
          const response = await GetHospitalAppointments(dateRange);
      setSummary(
        response?.summary || {
          today: 0,
          upcoming: 0,
          completed: 0,
          cancelled: 0,
        },
      );
      setAppointments(response?.appointments || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update appointment status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };
  const summaryCards = [
    {
      label: "Today's Total",
      value: summary.today,
      icon: CalendarDays,
      iconClass: "text-[#c8102e]",
      iconBg: "bg-red-50",
    },
    {
      label: "Upcoming",
      value: summary.upcoming,
      icon: CalendarCheck,
      iconClass: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      label: "Completed",
      value: summary.completed,
      icon: CheckCircle2,
      iconClass: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Cancelled",
      value: summary.cancelled,
      icon: XCircle,
      iconClass: "text-slate-500",
      iconBg: "bg-slate-100",
    },
  ];
  const doctors = [
    ...new Map(
      appointments
        .map((appointment) => [
          appointment.doctorId?._id,
          appointment.doctorId?.name,
        ])
        .filter(([, name]) => name),
    ).entries(),
  ];

  return (
    <main className="min-h-full bg-[#f8fafc] px-3 py-4 text-slate-900 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1240px]">
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summaryCards.map(
            ({ label, value, icon: Icon, iconClass, iconBg }) => (
              <article
                key={label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-red-100 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-extrabold text-slate-600">
                    {label}
                  </p>
                  <span
                    className={`grid size-10 place-items-center rounded-2xl ${iconBg}`}
                  >
                    <Icon className={`size-5 ${iconClass}`} />
                  </span>
                </div>
                <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
                  {value}
                </p>
              </article>
            ),
          )}
        </section>
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search patient..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
              />
            </label>
            <select className="h-10 rounded-xl cursor-pointer border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100">
              <option>All Doctors</option>
              {doctors.map(([id, name]) => (
                <option key={id}>{name}</option>
              ))}
            </select>
            <select className="h-10 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100">
              <option>All Status</option>
              <option>Confirmed</option>
              <option>Cancelled</option>
              <option>Completed</option>
            </select>
            <select value={dateRange} onChange={(event) => setDateRange(event.target.value)} className="h-10 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100">
              <option value="today">Today</option>
              <option value="last7">Last 7 Days</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </section>
        <section className="mt-5 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-4 py-4">
            <h2 className="text-base font-extrabold text-slate-950">
              Today's Appointments
            </h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Review and manage appointments scheduled for today
            </p>
          </div>
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
              {error}
            </p>
          )}
          <div className="overflow-visible">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50/80">
                <tr className="border-b border-slate-100 text-xs font-extrabold uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">Time</th>
                  <th className="px-3 py-3">Patient</th>
                  <th className="px-3 py-3">Doctor</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-3 py-8 text-center font-bold text-slate-500"
                    >
                      Loading appointments...
                    </td>
                  </tr>
                ) : appointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-3 py-8 text-center font-bold text-slate-500"
                    >
                      No appointments scheduled for today.
                    </td>
                  </tr>
                ) : (
                  appointments.map((appointment, index) => (
                    <tr
                      key={appointment._id}
                      className="border-b border-slate-100 transition hover:bg-red-50/30 last:border-0"
                    >
                      <td className="px-3 py-3 font-bold text-slate-500">
                        {index + 1}
                      </td>
                      <td className="px-3 py-3 font-extrabold text-slate-700">
                        {timeText(appointment.appointmentStart)}
                      </td>
                      <td className="px-3 py-3 font-bold text-slate-800">
                        {appointment.patientId?.name ||
                          appointment.patientId?.fullName ||
                          "Patient"}
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-600">
                        {appointment.doctorId?.name || "Doctor"}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-extrabold capitalize ${appointment.status === "completed" ? "bg-emerald-50 text-emerald-700" : appointment.status === "cancelled" ? "bg-red-50 text-red-700" : appointment.status === "confirmed" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            aria-label="Appointment actions"
                            disabled={updatingId === appointment._id}
                            onClick={() =>
                              setOpenMenu(
                                openMenu === appointment._id
                                  ? null
                                  : appointment._id,
                              )
                            }
                            className="grid size-8 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-[#c8102e] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <MoreVertical className="size-5" />
                          </button>
                          {openMenu === appointment._id && (
                            <div className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 text-left shadow-[0_10px_25px_rgba(15,23,42,0.14)]">
                              <button
                                type="button"
                                onClick={() =>
                                  changeStatus(appointment._id, "completed")
                                }
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-extrabold text-emerald-700 cursor-pointer hover:bg-emerald-50"
                              >
                                <CheckCircle2 className="size-4 " />
                                Mark Completed
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  changeStatus(appointment._id, "cancelled")
                                }
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-extrabold text-red-700 cursor-pointer hover:bg-red-50"
                              >
                                <XCircle className="size-4 " />
                                Mark Cancelled
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
};
