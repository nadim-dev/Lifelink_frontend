import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ArrowRight, CalendarCheck, CalendarDays, Clock3, Building2, ClipboardList, Droplet, Hospital, LoaderCircle, Stethoscope, Ticket, UsersRound } from "lucide-react";
import { GetMyAppointments } from "../api/appointmentApi.js";
import { getMyBloodRequests } from "../api/bloodBankApi.js";
import { getMyTicketsAll } from "../api/supportTicketApi.js";
import BecomeDonorCta from "../components/BecomeDonorCta";
import { formatDateOnly, formatTicketDate } from "../utils/dateCustomization.js";

const timeText = (value) =>
  new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

const healthcareOptions = [
  {
    title: "Nearby Hospitals",
    description: "Find hospitals around you",
    to: "/nearby-hospitals",
    icon: Building2,
    cardClass: "border-sky-100 bg-sky-50/80",
    iconClass: "bg-sky-100 text-sky-600",
    arrowClass: "bg-sky-100 text-sky-600 group-hover:bg-sky-600 group-hover:text-white",
  },
  {
    title: "Nearby Blood Banks",
    description: "Locate blood banks near you",
    to: "/nearby-blood-banks",
    icon: Droplet,
    cardClass: "border-rose-100 bg-rose-50/80",
    iconClass: "bg-rose-100 text-rose-500",
    arrowClass: "bg-rose-100 text-rose-500 group-hover:bg-rose-500 group-hover:text-white",
  },
  {
    title: "Nearby Donors",
    description: "Find willing donors near you",
    to: "/nearby-donors",
    icon: UsersRound,
    cardClass: "border-emerald-100 bg-emerald-50/80",
    iconClass: "bg-emerald-100 text-emerald-600",
    arrowClass: "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
  },
];

export const UserDashBoard = () => {
  const { user,setHeaderContent} = useOutletContext();
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [appointmentLoading, setAppointmentLoading] = useState(true);
  const [activeBloodRequest, setActiveBloodRequest] = useState(null);
  const [bloodRequestLoading, setBloodRequestLoading] = useState(true);
  const [ticketStats, setTicketStats] = useState({ total: 0, open: 0, resolved: 0 });
  console.log("user",user);
  

  useEffect(() => {
    setHeaderContent({
      title: `WELCOME  ${user.username}👋`,
      subtitle: "Your trusted healthcare companion starts here",
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const loadUpcomingAppointment = async () => {
      try {
        const response = await GetMyAppointments();
        const appointments = response?.appointments || [];
        const latestAppointment = [...appointments]
          .sort((a, b) => new Date(a.appointmentStart) - new Date(b.appointmentStart))[0];
        setUpcomingAppointment(latestAppointment || null);
      } catch {
        setUpcomingAppointment(null);
      } finally {
        setAppointmentLoading(false);
      }
    };

    loadUpcomingAppointment();
  }, []);

  useEffect(() => {
    const loadTicketStats = async () => {
      try {
        const response = await getMyTicketsAll();
        const tickets = response?.tickets || [];
        setTicketStats({
          total: tickets.length,
          open: tickets.filter((ticket) => ticket.status === "Open").length,
          resolved: tickets.filter((ticket) => ticket.status === "Resolved").length,
        });
      } catch {
        setTicketStats({ total: 0, open: 0, resolved: 0 });
      }
    };

    loadTicketStats();
  }, []);

  useEffect(() => {
    const loadActiveBloodRequest = async () => {
      try {
        const response = await getMyBloodRequests({ active: true });
        const requests = response?.bloodRequests || [];
        setActiveBloodRequest(requests[0] || null);
      } catch {
        setActiveBloodRequest(null);
      } finally {
        setBloodRequestLoading(false);
      }
    };

    loadActiveBloodRequest();
  }, []);




  return (
    <div className="space-y-4 py-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Link to="/appointments" className="group relative min-h-[150px] rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-rose-50 text-rose-600"><CalendarCheck className="size-6" /></span>
            <div>
              <p className="text-base font-bold leading-tight text-slate-600">Upcoming<br />Appointment</p>
              <p className="mt-1 text-3xl font-black text-slate-950">{appointmentLoading ? "—" : upcomingAppointment ? 1 : 0}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{upcomingAppointment ? `Next: ${timeText(upcomingAppointment.appointmentStart)}` : "No upcoming appointments"}</p>
            </div>
            <span className="absolute bottom-4 right-4 grid size-9 place-items-center rounded-full bg-rose-50 text-rose-500 transition group-hover:bg-rose-600 group-hover:text-white"><ArrowRight className="size-4" /></span>
          </div>
        </Link>

        <Link to="/my-requests" className="group relative min-h-[150px] rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-rose-50 text-rose-600"><Droplet className="size-6" fill="currentColor" /></span>
            <div>
              <p className="text-base font-bold leading-tight text-slate-600">Active<br />Blood Request</p>
              <p className="mt-1 text-3xl font-black text-slate-950">{bloodRequestLoading ? "—" : activeBloodRequest ? 1 : 0}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{activeBloodRequest ? "In Progress" : "No active requests"}</p>
            </div>
            <span className="absolute bottom-4 right-4 grid size-9 place-items-center rounded-full bg-rose-50 text-rose-500 transition group-hover:bg-rose-600 group-hover:text-white"><ArrowRight className="size-4" /></span>
          </div>
        </Link>

        <Link to="/my-tickets" className="group relative min-h-[150px] rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-600"><Ticket className="size-6" /></span>
            <div>
              <p className="text-base font-bold text-slate-600">My Tickets</p>
              <p className="mt-1 text-3xl font-black text-slate-950">{ticketStats.total}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{ticketStats.open} Open • {ticketStats.resolved} Resolved</p>
            </div>
            <span className="absolute bottom-4 right-4 grid size-9 place-items-center rounded-full bg-rose-50 text-rose-500 transition group-hover:bg-rose-600 group-hover:text-white"><ArrowRight className="size-4" /></span>
          </div>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="h-full rounded-xl border border-slate-100 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-base font-extrabold text-slate-800">Upcoming Appointment</h2>
          <Link to="/appointments" className="text-[10px] font-bold text-rose-500 transition hover:text-rose-600 sm:text-xs">
            View All <span aria-hidden="true">→</span>
          </Link>
        </div>

        {appointmentLoading ? (
          <div className="flex items-center justify-center py-8 text-xs font-bold text-slate-500">
            <LoaderCircle className="mr-2 size-4 animate-spin" /> Loading appointment...
          </div>
        ) : upcomingAppointment ? (
          <article className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                {upcomingAppointment.doctorId?.profileImage ? (
                  <img
                    src={upcomingAppointment.doctorId.profileImage}
                    alt={`${upcomingAppointment.doctorId?.name || "Doctor"} profile`}
                    className="size-11 shrink-0 rounded-full border border-white object-cover shadow-sm"
                  />
                ) : (
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-500">
                    <Stethoscope className="size-5" />
                  </span>
                )}
                <div className="min-w-0">
                  <h3 className="truncate text-base font-extrabold text-slate-900">
                    Dr. {upcomingAppointment.doctorId?.name || "Doctor"}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-500">
                    <Stethoscope className="size-3.5 text-blue-500" />
                    {upcomingAppointment.doctorId?.specialization || upcomingAppointment.doctorId?.department || "Medical consultation"}
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold capitalize text-emerald-700">
                {upcomingAppointment.status}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5"><CalendarCheck className="size-3.5 text-blue-500" />{formatDateOnly(upcomingAppointment.appointmentStart)}</span>
              <span className="flex items-center gap-1.5"><Clock3 className="size-3.5 text-blue-500" />{timeText(upcomingAppointment.appointmentStart)}</span>
              <span className="col-span-2 flex items-center gap-1.5 truncate"><Hospital className="size-3.5 shrink-0 text-rose-500" />{upcomingAppointment.hospitalId?.name || "Hospital"}</span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <p className="text-xs font-extrabold text-slate-500">Appointment Number <span className="text-slate-900">{upcomingAppointment.tokenNumber}</span></p>
              <Link to="/appointments" className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-rose-700">
                View Appointment <ArrowRight className="size-3" />
              </Link>
            </div>
          </article>
        ) : (
          <p className="rounded-lg bg-slate-50 px-3 py-6 text-center text-xs font-semibold text-slate-500">No upcoming appointments.</p>
        )}
        </section>

        <section className="h-full rounded-xl border border-slate-100 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-base font-extrabold text-slate-800">Active Blood Request</h2>
          <Link to="/my-requests" className="text-[10px] font-bold text-rose-500 transition hover:text-rose-600 sm:text-xs">
            View All <span aria-hidden="true">→</span>
          </Link>
        </div>

        {bloodRequestLoading ? (
          <div className="flex items-center justify-center py-8 text-xs font-bold text-slate-500">
            <LoaderCircle className="mr-2 size-4 animate-spin" /> Loading request...
          </div>
        ) : activeBloodRequest ? (
          <article className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-red-50 text-red-500">
                  <Droplet className="size-5" fill="currentColor" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {activeBloodRequest.items?.[0]?.bloodGroup || "Blood"} <span className="text-slate-500">·</span> {activeBloodRequest.items?.[0]?.component || "Blood component"}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">{activeBloodRequest.items?.[0]?.quantity || 0} Unit</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold text-amber-700">
                {activeBloodRequest.requestStatus === "Pending" ? "In Progress" : activeBloodRequest.requestStatus}
              </span>
            </div>

            <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-xs font-bold text-slate-600">
              <span className="flex min-w-0 items-center gap-1.5"><Building2 className="size-3.5 shrink-0 text-blue-500" /><span className="truncate">Requested from: <strong className="text-slate-800">{activeBloodRequest.bloodBankId?.bloodBankName || "Blood Bank"}</strong></span></span>
              <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5 text-emerald-500" />Request Date: {formatTicketDate(activeBloodRequest.createdAt)}</span>
              <span className="flex items-center gap-1.5"><ClipboardList className="size-3.5 text-violet-500" />Request ID: {activeBloodRequest.requestNumber || activeBloodRequest._id}</span>
            </div>

            <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
              <Link to={`/my-requests/${activeBloodRequest._id}`} className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-red-700">
                Track Request <ArrowRight className="size-3" />
              </Link>
            </div>
          </article>
        ) : (
          <p className="rounded-lg bg-slate-50 px-3 py-6 text-center text-xs font-semibold text-slate-500">No active blood requests.</p>
        )}
        </section>
      </div>

      {!user.isDonor && <BecomeDonorCta />}

      <section className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-slate-800 sm:text-base">Find Healthcare Near You</h2>
         
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {healthcareOptions.map(({ title, description, to, icon: Icon, cardClass, iconClass, arrowClass }) => (
            <Link
              key={title}
              to={to}
              className={`group flex min-h-[72px] items-center gap-2 rounded-lg border px-3 py-2.5 transition hover:-translate-y-0.5 hover:shadow-sm ${cardClass}`}
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${iconClass}`}>
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-extrabold text-slate-800 sm:text-sm">{title}</span>
                <span className="mt-0.5 block text-[11px] font-medium leading-tight text-slate-500 sm:text-xs">{description}</span>
              </span>
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full transition ${arrowClass}`}>
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.8} />
              </span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};
