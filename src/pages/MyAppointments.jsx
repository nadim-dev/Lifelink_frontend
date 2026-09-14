import { useEffect, useState } from "react";
import {CalendarCheck,Clock3,Hospital,LoaderCircle,Stethoscope,} from "lucide-react";
import { GetMyAppointments } from "../api/appointmentApi.js";
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

  return (
    <main className="min-h-full bg-[#f8fafc] px-3 py-4 text-slate-900 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1100px] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
          <span>Please try to arrive 15 minutes before your appointment.</span>
          <Link
            to="/appointments"
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
        <div className="grid gap-3 md:grid-cols-2">
          {appointments.map((appointment) => (
            <article
              key={appointment._id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_5px_20px_rgba(15,23,42,0.04)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-950">
                    Dr. {appointment.doctorId?.name || "Doctor"}
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Stethoscope className="size-4 text-blue-500" />
                    {appointment.doctorId?.specialization ||
                      appointment.doctorId?.department ||
                      "Medical consultation"}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold capitalize text-emerald-700">
                  {appointment.status}
                </span>
              </div>
              <div className="mt-4 grid gap-2 border-t border-slate-100 pt-3 text-sm font-bold text-slate-600 sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <CalendarCheck className="size-4 text-blue-500" />
                  {formatDateOnly(appointment.appointmentStart)}
                </p>
                <p className="flex items-center gap-2">
                  <Clock3 className="size-4 text-blue-500" />
                  {timeText(appointment.appointmentStart)}
                </p>
                <p className="flex items-center gap-2 sm:col-span-2">
                  <Hospital className="size-4 text-rose-500" />
                  {appointment.hospitalId?.name || "Hospital"}
                </p>
              </div>
              <p className="mt-3 text-xs font-extrabold text-slate-500">
                Appointment Number:{" "}
                <span className="text-slate-900">
                  {appointment.tokenNumber}
                </span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
