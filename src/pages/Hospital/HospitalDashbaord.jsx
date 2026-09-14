import { useEffect, useState } from "react";
import { BedDouble, CalendarCheck, Check, CheckCircle2, Hospital, LoaderCircle, Siren, Stethoscope, X } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import { GetHospitalAppointments } from "../../api/appointmentApi.js";
import { getHospitalDoctors, getMyHospitalDashboardSummary, getMyHospitalProfile, updateMyEmergencyStatus } from "../../api/hospitalApi";

const timeText = (value) => new Date(value).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

export const HospitalDashboard = () => {
  const { setHeaderContent } = useOutletContext();
  const [summary, setSummary] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [bedGroups, setBedGroups] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [emergencyStatus, setEmergencyStatus] = useState("Operational");
  const [savingEmergency, setSavingEmergency] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHeaderContent({
      title: "Hospital Dashboard",
      subtitle:
        "Monitor your hospital operations, resources, and patient services in one place",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    Promise.all([getMyHospitalDashboardSummary(), GetHospitalAppointments("today"), getMyHospitalProfile(), getHospitalDoctors()])
      .then(([dashboardResponse, appointmentsResponse, profileResponse, doctorsResponse]) => {
        setSummary(dashboardResponse?.summary);
        setAppointments((appointmentsResponse?.appointments || []).slice(0, 4));
        const beds = profileResponse?.hospital?.capacity?.beds || {};
        setBedGroups([["General", beds.general], ["Private", beds.private], ["ICU", beds.icu]].map(([label, bed]) => ({ label, available: Math.max(Number(bed?.total || 0) - Number(bed?.occupied || 0), 0) })));
        setDoctors((doctorsResponse?.doctors || []).slice(0, 3));
        setEmergencyStatus({ available: "Operational", limited: "Limited", unavailable: "Unavailable" }[profileResponse?.hospital?.capacity?.emergencyStatus] || "Operational");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex min-h-40 items-center justify-center text-sm font-bold text-slate-500">
        <LoaderCircle className="mr-2 size-5 animate-spin text-red-600" />
        Loading dashboard...
      </div>
    );

  return (
    <main className="min-h-full bg-[#f8fafc] px-3 py-4 text-slate-900 sm:px-5 lg:px-6">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            icon={CalendarCheck}
            iconClass="text-red-600"
            iconBg="bg-red-50"
            label="Appointments"
            value={summary?.appointmentsToday ?? 0}
            detail="Today"
          />
          <DashboardCard
            icon={Stethoscope}
            iconClass="text-blue-600"
            iconBg="bg-blue-50"
            label="Doctors"
            value={summary?.activeDoctors ?? 0}
            detail="Active"
          />
          <DashboardCard
            icon={BedDouble}
            iconClass="text-violet-600"
            iconBg="bg-violet-50"
            label="Available Beds"
            value={summary?.availableBeds ?? 0}
            detail={`of ${summary?.totalBeds ?? 0}`}
          />
          <DashboardCard
            icon={Hospital}
            iconClass="text-emerald-600"
            iconBg="bg-emerald-50"
            label="Emergency Status"
            value={({ available: "Available", limited: "Limited", unavailable: "Unavailable" }[summary?.emergencyStatus] || "Unavailable")}
            detail={summary?.emergencyStatus === "available" ? "Open 24/7" : "Status requires attention"}
          />
        </section>
        <section className="order-2 mt-5 grid gap-4 xl:grid-cols-2">
          <DashboardPanel title="Doctor Availability" icon={Stethoscope} iconClass="text-emerald-600" iconBg="bg-emerald-50">
            <div className="divide-y divide-slate-100">
              {doctors.length === 0 ? <p className="py-5 text-sm font-semibold text-slate-500">No doctors available.</p> : doctors.map((doctor) => <div key={doctor._id} className="flex items-center justify-between gap-3 py-3 text-sm"><div className="min-w-0"><p className="truncate font-extrabold text-slate-700">Dr. {doctor.name}</p><p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{doctor.specialization || doctor.department || "Medical professional"}</p></div><span className={`inline-flex shrink-0 items-center gap-2 font-extrabold ${doctor.status === "active" ? "text-emerald-700" : "text-red-600"}`}><span className={`size-2.5 rounded-full ${doctor.status === "active" ? "bg-emerald-500" : "bg-red-500"}`} />{doctor.status === "active" ? "Available" : "Unavailable"}</span></div>)}
            </div>
            <Link to="/hospital/doctors" className="mt-3 flex cursor-pointer items-center border-t border-slate-100 pt-4 text-sm font-extrabold text-red-600 hover:text-red-700">View All <span className="ml-1">→</span></Link>
          </DashboardPanel>
          <DashboardPanel title="Emergency Status" icon={Siren} iconClass="text-blue-600" iconBg="bg-blue-50">
            <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 p-4"><div><p className="text-sm font-extrabold text-slate-700">Current status</p><p className="mt-1 text-lg font-extrabold text-blue-700">{emergencyStatus}</p></div><CheckCircle2 className="size-8 text-blue-600" /></div>
            <button type="button" onClick={() => setShowEmergencyModal(true)} className="mt-4 inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-red-200 text-sm font-extrabold text-red-600 hover:bg-red-50">Update Status</button>
          </DashboardPanel>
        </section>
        {showEmergencyModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4" onClick={() => !savingEmergency && setShowEmergencyModal(false)}><div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-extrabold text-slate-900">Change Emergency Status</h3><p className="mt-1 text-xs font-medium text-slate-500">Select the current availability of emergency services.</p></div><button type="button" onClick={() => setShowEmergencyModal(false)} className="grid size-8 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><X className="size-5" /></button></div><div className="mt-5 space-y-3">{[{ value: "Operational", apiValue: "available", description: "Emergency services are fully available.", color: "emerald" }, { value: "Limited", apiValue: "limited", description: "Emergency services are available with limitations.", color: "amber" }, { value: "Unavailable", apiValue: "unavailable", description: "Emergency services are temporarily unavailable.", color: "red" }].map((option) => <button type="button" key={option.value} disabled={savingEmergency} onClick={async () => { setSavingEmergency(true); try { await updateMyEmergencyStatus(option.apiValue); setEmergencyStatus(option.value); setSummary((current) => ({ ...current, emergencyStatus: option.apiValue })); setShowEmergencyModal(false); } finally { setSavingEmergency(false); } }} className="flex w-full cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-red-200 hover:bg-red-50/30 disabled:cursor-not-allowed disabled:opacity-60"><span className={`mt-0.5 grid size-5 place-items-center rounded-full border-2 ${emergencyStatus === option.value ? `border-${option.color}-500` : "border-slate-300"}`}>{emergencyStatus === option.value && <Check className={`size-3 text-${option.color}-600`} strokeWidth={4} />}</span><span><span className={`block font-extrabold ${emergencyStatus === option.value ? `text-${option.color}-700` : "text-slate-800"}`}>{option.value}</span><span className="block text-xs font-medium text-slate-500">{option.description}</span></span></button>)}</div></div></div>}
        <section className="order-1 mt-5 grid gap-4 xl:grid-cols-2">
          <DashboardPanel title="Today's Appointments" icon={CalendarCheck} iconClass="text-red-600" iconBg="bg-red-50">
            <div className="divide-y divide-slate-100">
              {appointments.length === 0 ? <p className="py-5 text-sm font-semibold text-slate-500">No appointments scheduled today.</p> : appointments.map((appointment) => <div key={appointment._id} className="grid grid-cols-[72px_minmax(0,1fr)_minmax(0,1fr)] gap-3 py-3 text-sm"><span className="font-extrabold text-slate-500">{timeText(appointment.appointmentStart)}</span><span className="truncate font-extrabold text-slate-900">{appointment.patientId?.name || appointment.patientId?.fullName || "Patient"}</span><span className="truncate font-semibold text-slate-600">{appointment.doctorId?.name || "Doctor"}</span></div>)}
            </div>
            <Link to="/hospital/appointments" className="mt-3 flex cursor-pointer items-center border-t border-slate-100 pt-4 text-sm font-extrabold text-red-600 hover:text-red-700">View All <span className="ml-1">→</span></Link>
          </DashboardPanel>
          <DashboardPanel title="Bed Availability" icon={BedDouble} iconClass="text-violet-600" iconBg="bg-violet-50">
            <div className="divide-y divide-slate-100">{bedGroups.map((bed) => <div key={bed.label} className="flex items-center justify-between py-3 text-sm"><span className="font-extrabold text-slate-700">{bed.label}</span><span className="font-extrabold text-emerald-700">{bed.available} available</span></div>)}</div>
            <Link to="/hospital/capacity-availability" className="mt-3 flex cursor-pointer items-center border-t border-slate-100 pt-4 text-sm font-extrabold text-red-600 hover:text-red-700">View Details <span className="ml-1">→</span></Link>
          </DashboardPanel>
        </section>
      </div>
    </main>
  );
};

const DashboardCard = ({
  icon: Icon,
  iconClass,
  iconBg,
  label,
  value,
  detail,
}) => (
  <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(30,64,175,0.06)]">
    <div className="flex items-center gap-3">
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-2xl ${iconBg}`}
      >
        <Icon className={`size-6 ${iconClass}`} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-slate-600">{label}</p>
        <p className="mt-1 text-2xl font-extrabold leading-none text-slate-950">
          {value}
        </p>
        {detail && (
          <p className="mt-2 text-xs font-semibold text-slate-500">{detail}</p>
        )}
      </div>
    </div>
  </article>
);

const DashboardPanel = ({ title, icon: Icon, iconClass, iconBg, children }) => (
  <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(30,64,175,0.06)]">
    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
      <span className={`grid size-10 place-items-center rounded-xl ${iconBg}`}><Icon className={`size-5 ${iconClass}`} /></span>
      <h2 className="text-base font-extrabold text-slate-950">{title}</h2>
    </div>
    {children}
  </article>
);
