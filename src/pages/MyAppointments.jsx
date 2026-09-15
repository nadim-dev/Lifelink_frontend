import { useEffect, useState } from "react";
import { CalendarCheck, CalendarDays, Clock3, Hospital, LoaderCircle, Stethoscope, X } from "lucide-react";
import { GetMyAppointmentHistory, GetMyAppointments } from "../api/appointmentApi.js";
import { Link, useOutletContext } from "react-router-dom";
import { formatDateOnly } from "../utils/dateCustomization.js";

const timeText = (value) =>
  new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const { setHeaderContent } = useOutletContext();

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const response = await GetMyAppointments();
        setAppointments(response?.appointments || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load appointments.");
      } finally {
        setLoading(false);
      }
    };
    loadAppointments();
  }, []);

  useEffect(() => {
    setHeaderContent({
      title: "My Appointments",
      subtitle: "Your upcoming doctor appointments",
      action: undefined,
    });
  }, [setHeaderContent]);

  const openHistory = async () => {
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const response = await GetMyAppointmentHistory();
      setHistory(response?.appointments || []);
    } catch (err) {
      setHistoryError(err.response?.data?.message || "Unable to load appointment history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <main className="min-h-full bg-[#f8fafc] px-3 py-4 text-slate-900 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1100px] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
          <span>Please try to arrive 15 minutes before your appointment.</span>
          <Link
            to="#"
            onClick={(event) => { event.preventDefault(); openHistory(); }}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700 transition hover:border-blue-300 hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
          >
            <CalendarCheck className="size-4" />
            Appointment History
          </Link>
        </div>
        {loading && (
          <div className="flex justify-center py-12 text-sm font-bold text-slate-500">
            <LoaderCircle className="mr-2 size-5 animate-spin" />
            Loading appointments...
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {error}
          </div>
        )}
        {!loading && !error && appointments.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center text-sm font-bold text-slate-500">
            You have no current upcoming appointments.
          </div>
        )}
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <article
              key={appointment._id}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_5px_20px_rgba(15,23,42,0.04)] sm:px-6 sm:py-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {appointment.doctorId?.profileImage ? (
                    <img
                      src={appointment.doctorId.profileImage}
                      alt={`${appointment.doctorId?.name || "Doctor"} profile`}
                      className="size-14 shrink-0 rounded-full border border-slate-100 object-cover sm:size-16"
                    />
                  ) : (
                    <span className="grid size-14 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-500 sm:size-16">
                      <Stethoscope className="size-7" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <h2 className="text-xl font-extrabold text-slate-950 sm:text-2xl">
                      Dr. {appointment.doctorId?.name || "Doctor"}
                    </h2>
                    <p className="mt-1.5 flex items-center gap-2 text-base font-semibold text-slate-500">
                      <Stethoscope className="size-5 shrink-0 text-blue-500" />
                      {appointment.doctorId?.specialization ||
                        appointment.doctorId?.department ||
                        "Medical consultation"}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-extrabold capitalize text-emerald-700">
                  {appointment.status}
                </span>
              </div>
              <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 text-lg font-bold text-slate-600 sm:grid-cols-2">
                <p className="flex items-center gap-2.5">
                  <CalendarCheck className="size-5 text-blue-500" />
                  {formatDateOnly(appointment.appointmentStart)}
                </p>
                <p className="flex items-center gap-2.5">
                  <Clock3 className="size-5 text-blue-500" />
                  {timeText(appointment.appointmentStart)}
                </p>
                <p className="flex items-center gap-2.5 sm:col-span-2">
                  <Hospital className="size-5 text-rose-500" />
                  {appointment.hospitalId?.name || "Hospital"}
                </p>
              </div>
              <p className="mt-5 text-base font-extrabold text-slate-500">
                Appointment Number:{" "}
                <span className="text-slate-900">
                  {appointment.tokenNumber}
                </span>
              </p>
            </article>
          ))}
        </div>
        {historyOpen && (
          <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/45 p-4" onClick={() => setHistoryOpen(false)}>
            <section className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div><h2 className="text-lg font-extrabold text-slate-950">Appointment History</h2><p className="mt-1 text-xs font-semibold text-slate-500">Your previous and current appointments</p></div>
                <button type="button" onClick={() => setHistoryOpen(false)} className="grid size-9 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"><X className="size-5" /></button>
              </div>
              <div className="max-h-[65vh] overflow-y-auto p-5">
                {historyLoading && <div className="flex justify-center py-10 text-sm font-bold text-slate-500"><LoaderCircle className="mr-2 size-5 animate-spin" />Loading history...</div>}
                {historyError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{historyError}</p>}
                {!historyLoading && !historyError && history.length === 0 && <p className="py-10 text-center text-sm font-bold text-slate-500">No appointment history found.</p>}
                <div className="grid gap-3">
                  {!historyLoading && history.map((appointment) => (
                    <article key={appointment._id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
                      <div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-extrabold text-slate-950">Dr. {appointment.doctorId?.name || "Doctor"}</h3><p className="mt-1 text-sm font-semibold text-slate-500">{appointment.hospitalId?.name || "Hospital"}</p></div><span className={`rounded-full px-3 py-2 text-sm font-extrabold capitalize ${appointment.status === "completed" ? "bg-emerald-50 text-emerald-700" : appointment.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>{appointment.status}</span></div>
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-sm font-bold text-slate-600"><span className="flex items-center gap-2"><CalendarDays className="size-4 text-violet-600" />{formatDateOnly(appointment.appointmentStart)}</span><span className="flex items-center gap-2"><Clock3 className="size-4 text-amber-600" />{timeText(appointment.appointmentStart)}</span></div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
