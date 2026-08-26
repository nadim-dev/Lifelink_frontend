import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useOutletContext } from "react-router-dom";
import { getHospitalDoctors, updateDoctor, updateDoctorSchedule, updateDoctorStatus } from "../../api/hospitalApi";
import { ScheduleEditor } from "../../components/Hospital/ScheduleEditor";
import {CalendarDays,CalendarCheck,CheckCircle2,ChevronLeft,ChevronRight,Clock3,Eye,MoreVertical,Pencil,Plus,Search,Stethoscope,UserRound,UserX} from "lucide-react";

const formatShiftTime = (time) => {
  if (!time) return "—";
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

const InfoSection = ({ title, children }) => <section><h3 className="mb-3 border-b border-slate-100 pb-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">{title}</h3><div className="space-y-2">{children}</div></section>;
const Info = ({ label, value }) => <div className="flex items-start justify-between gap-3 text-sm"><span className="font-semibold text-slate-500">{label}</span><span className="text-right font-bold text-slate-800">{value}</span></div>;
const formatQualifications = (value) => {
  if (Array.isArray(value)) return value.join(", ") || "—";
  try { const parsed = JSON.parse(value || "[]"); return Array.isArray(parsed) ? parsed.join(", ") || "—" : value || "—"; } catch { return value || "—"; }
};

const doctors = [
  [
    "Dr. Rahul Sharma",
    "rahul.sharma@lifecare.com",
    "Cardiology",
    "Interventional Cardiologist",
    10,
    "9:00 AM – 6:00 PM",
    "Active",
    true,
  ],
  [
    "Dr. Priya Patel",
    "priya.patel@lifecare.com",
    "Orthopedics",
    "Orthopedic Surgeon",
    8,
    "10:00 AM – 5:00 PM",
    "Active",
    true,
  ],
  [
    "Dr. Amit Verma",
    "amit.verma@lifecare.com",
    "Neurology",
    "Neurologist",
    12,
    "—",
    "On Leave",
    false,
  ],
  [
    "Dr. Neha Gupta",
    "neha.gupta@lifecare.com",
    "Dermatology",
    "Dermatologist",
    6,
    "9:00 AM – 4:00 PM",
    "Active",
    true,
  ],
  [
    "Dr. Sandeep Kumar",
    "sandeep.kumar@lifecare.com",
    "Pediatrics",
    "Pediatrician",
    15,
    "—",
    "Inactive",
    false,
  ],
];

const sampleStatCards = [
  [
    "Total Doctors",
    doctors.length,
    "All registered doctors",
    UserRound,
    "bg-red-50 text-red-600",
  ],
  [
    "Available Today",
    doctors.filter((doctor) => doctor[7]).length,
    "Doctors available today",
    CheckCircle2,
    "bg-emerald-50 text-emerald-600",
  ],
  [
    "On Leave",
    doctors.filter((doctor) => doctor[6] === "On Leave").length,
    "Doctors on leave",
    Clock3,
    "bg-orange-50 text-orange-500",
  ],
  [
    "Appointments Today",
    42,
    "Total appointments",
    CalendarDays,
    "bg-violet-50 text-violet-600",
  ],
];

export const DoctorPage = () => {
  const { setHeaderContent } = useOutletContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Status");
  const [availability, setAvailability] = useState("All");
  const [openMenu, setOpenMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [actionError, setActionError] = useState("");
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editingSchedule, setEditingSchedule] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    getHospitalDoctors().then((response) => {
      setDoctors(response.doctors || []);
    }).catch(() => setDoctors([]));
  }, []);

  const handleStatusChange = async (doctorId, status) => {
    try {
      setActionError("");
      await updateDoctorStatus(doctorId, status);
      const response = await getHospitalDoctors();
      setDoctors(response.doctors || []);
      setOpenMenu(null);
      setMenuPosition(null);
    } catch (error) {
      setActionError(error.message || "Unable to deactivate doctor.");
    }
  };
  const openSchedule = (doctorId) => {
    const doctor = doctors.find((item) => item._id === doctorId);
    setEditingDoctor(doctor);
    setEditingSchedule(doctor?.availability || []);
    setOpenMenu(null);
    setMenuPosition(null);
  };
  const openDetails = (doctorId) => {
    setViewingDoctor(doctors.find((item) => item._id === doctorId) || null);
    setOpenMenu(null);
    setMenuPosition(null);
  };
  const openEdit = (doctorId) => {
    const doctor = doctors.find((item) => item._id === doctorId);
    if (!doctor) return;
    setEditingProfile(doctor);
    setEditForm({ name: doctor.name || "", email: doctor.email || "", phoneNumber: doctor.phoneNumber || "", department: doctor.department || "", specialization: doctor.specialization || "", qualifications: (doctor.qualifications || []).join(", "), experience: doctor.experience ?? "", registrationNumber: doctor.registrationNumber || "", consultationFee: doctor.consultationFee ?? 0, appointmentDuration: doctor.appointmentDuration ?? 30, status: doctor.status || "active", availability: doctor.availability || [] });
    setOpenMenu(null); setMenuPosition(null);
  };
  const saveEdit = async (event) => {
    event.preventDefault();
    try { await updateDoctor(editingProfile._id, { ...editForm, qualifications: editForm.qualifications.split(",").map((item) => item.trim()).filter(Boolean) }); const response = await getHospitalDoctors(); setDoctors(response.doctors || []); setEditingProfile(null); } catch (error) { setActionError(error.message || "Unable to update doctor."); }
  };
  const saveSchedule = async () => {
    try {
      await updateDoctorSchedule(editingDoctor._id, editingSchedule);
      const response = await getHospitalDoctors();
      setDoctors(response.doctors || []);
      setEditingDoctor(null);
    } catch (error) {
      setActionError(error.message || "Unable to update doctor schedule.");
    }
  };

  const doctorRows = doctors.map((doctor) => {
    const availableDay = doctor.availability?.find((day) => day.isAvailable);
    const firstShift = availableDay?.shifts?.[0];
    const available = Boolean(availableDay);
    const time = firstShift ? `${formatShiftTime(firstShift.startTime)} – ${formatShiftTime(firstShift.endTime)}` : "—";
    return [doctor.name, doctor.email || "", doctor.department, doctor.specialization, doctor.experience, time, doctor.status === "active" ? "Active" : doctor.status === "on_leave" ? "On Leave" : "Inactive", available, doctor.phoneNumber, doctor.profileImage, doctor._id];
  });
  const statCards = [
    ["Total Doctors", doctors.length, "All registered doctors", UserRound, "bg-red-50 text-red-600"],
    ["Available Today", doctors.filter((doctor) => doctor.availability?.some((day) => day.isAvailable)).length, "Doctors available today", CheckCircle2, "bg-emerald-50 text-emerald-600"],
    ["On Leave", doctors.filter((doctor) => doctor.status === "on_leave").length, "Doctors on leave", Clock3, "bg-orange-50 text-orange-500"],
    ["Appointments Today", 0, "Total appointments", CalendarDays, "bg-violet-50 text-violet-600"],
  ];

  useEffect(() => {
    setHeaderContent({
      title: "Doctors",
      subtitle: "Manage doctors, their availability and appointments.",
      action: undefined,
    });
  }, [setHeaderContent]);
  
  const visibleDoctors = useMemo(
    () =>
      doctorRows.filter((doctor) => {
        const query = search.toLowerCase().trim();
        return (
          (!query ||
            doctor
              .slice(0, 4)
              .some((value) => String(value).toLowerCase().includes(query))) &&
          (department === "All Departments" || doctor[2] === department) &&
          (status === "All Status" || doctor[6] === status) &&
          (availability === "All" ||
            (availability === "Available" ? doctor[7] : !doctor[7]))
        );
      }),
    [availability, department, search, status, doctorRows],
  );

  return (
    <section className="min-h-[calc(100vh-120px)] bg-[#F8FAFC] px-3 py-4 sm:px-5 lg:px-6">
      <style>{`.fixed[class*="max-w-3xl"] { max-width: 42rem; max-height: 85vh; padding: 1rem; } .fixed[class*="max-w-lg"] { max-width: 48rem; }`}</style>
      <div className="mx-auto max-w-7xl space-y-4">
        {actionError && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{actionError}</p>}
        {editingProfile && <div className="fixed inset-0 z-[10000] grid place-items-center bg-slate-950/40 p-4"><form onSubmit={saveEdit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-extrabold text-slate-900">Edit Doctor</h2><p className="text-xs font-semibold text-slate-500">Update doctor information</p></div><button type="button" onClick={() => setEditingProfile(null)} className="cursor-pointer text-xl text-slate-400">×</button></div><div className="grid gap-4 sm:grid-cols-2">{[["name","Full Name"],["email","Email"],["phoneNumber","Phone Number"],["department","Department"],["specialization","Specialization"],["qualifications","Qualifications"],["experience","Experience (Years)"],["registrationNumber","Registration Number"],["consultationFee","Consultation Fee"],["appointmentDuration","Appointment Duration"]].map(([name,label]) => <label key={name} className="text-xs font-bold text-slate-700">{label}<input name={name} value={editForm[name] ?? ""} onChange={(event) => setEditForm((current) => ({ ...current, [name]: event.target.value }))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" /></label>)}</div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setEditingProfile(null)} className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600">Cancel</button><button className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white">Save Changes</button></div></form></div>}
        {viewingDoctor && <div className="fixed inset-0 z-[10000] grid place-items-center bg-slate-950/40 p-4"><div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="flex items-start gap-4 border-b border-slate-100 p-5"><div className="shrink-0">{viewingDoctor.profileImage ? <img src={viewingDoctor.profileImage} alt={`${viewingDoctor.name} profile`} className="size-16 rounded-2xl object-cover" /> : <div className="grid size-16 place-items-center rounded-2xl bg-red-50 text-red-600"><Stethoscope className="size-7" /></div>}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-extrabold text-slate-900">{viewingDoctor.name}</h2><p className="mt-1 text-sm font-semibold text-slate-500">{viewingDoctor.specialization}</p></div><button type="button" onClick={() => setViewingDoctor(null)} className="cursor-pointer text-xl text-slate-400">×</button></div><span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${viewingDoctor.status === "active" ? "bg-emerald-50 text-emerald-700" : viewingDoctor.status === "on_leave" ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-700"}`}>{viewingDoctor.status === "active" ? "Active" : viewingDoctor.status === "on_leave" ? "On Leave" : "Inactive"}</span></div></div><div className="grid gap-5 p-5 sm:grid-cols-2"><InfoSection title="Professional Information"><Info label="Department" value={viewingDoctor.department} /><Info label="Qualifications" value={viewingDoctor.qualifications?.join(", ") || "—"} /><Info label="Experience" value={`${viewingDoctor.experience ?? 0} Years`} /><Info label="Consultation Fee" value={`₹${viewingDoctor.consultationFee ?? 0}`} /></InfoSection><InfoSection title="Contact Information"><Info label="Phone Number" value={viewingDoctor.phoneNumber || "—"} /><Info label="Email" value={viewingDoctor.email || "—"} /></InfoSection></div></div></div>}
        {editingDoctor && <div className="fixed inset-0 z-[10000] grid place-items-center bg-slate-950/40 p-4"><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold text-slate-900">Manage Schedule</h2><p className="text-xs font-semibold text-slate-500">{editingDoctor.name}</p></div><button type="button" onClick={() => setEditingDoctor(null)} className="cursor-pointer text-xl text-slate-400">×</button></div><ScheduleEditor schedule={editingSchedule} setSchedule={setEditingSchedule} /><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setEditingDoctor(null)} className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600">Cancel</button><button type="button" onClick={saveSchedule} className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white">Save Schedule</button></div></div></div>}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(([label, value, note, Icon, tone]) => (
            <article
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {value}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-400">
                    {note}
                  </p>
                </div>
                <span
                  className={`grid size-10 place-items-center rounded-xl ${tone}`}
                >
                  <Icon className="size-5" />
                </span>
              </div>
            </article>
          ))}
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap gap-3 border-b border-slate-100 p-3">
            <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 focus-within:border-red-400 focus-within:bg-white">
              <Search className="size-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or specialization..."
                className="min-w-0 flex-1 bg-transparent text-xs font-semibold outline-none placeholder:text-slate-400"
              />
            </label>
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 sm:w-40"
            >
              <option>All Departments</option>
              {[...new Set(doctorRows.map((doctor) => doctor[2]))].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 sm:w-32"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>On Leave</option>
              <option>Inactive</option>
            </select>
            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 sm:w-32"
            >
              <option>All</option>
              <option>Available</option>
              <option>Not Available</option>
            </select>
            <button
              type="button"
              onClick={() => navigate("/hospital/doctors/add")}
              className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#b40000] px-4 text-xs font-bold text-white hover:bg-[#920000] sm:w-auto"
            >
              <Plus className="size-4" /> Add Doctor
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                <tr>
                  {[
                    "Doctor",
                    "Department",
                    "Specialization",
                    "Experience",
                    "Availability",
                    "Status",
                    "Actions",
                  ].map((title) => (
                    <th key={title} className="px-4 py-3">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleDoctors.map((doctor, index) => (
                  <tr
                    key={doctor[0]}
                    className={`text-xs text-slate-600 hover:bg-red-50/30 ${openMenu === index ? "relative z-30" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {doctor[9] ? (
                          <img src={doctor[9]} alt={`${doctor[0]} profile`} className="size-9 rounded-full object-cover" />
                        ) : (
                          <span className="grid size-9 place-items-center rounded-full bg-red-100 text-red-700">
                            <Stethoscope className="size-4" />
                          </span>
                        )}
                        <div>
                          <p className="font-extrabold text-slate-800">
                            {doctor[0]}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {doctor[1]}
                          </p>
                      <p className="text-[10px] text-slate-400">
                            {doctor[8] || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{doctor[2]}</td>
                    <td className="px-4 py-3 font-semibold">{doctor[3]}</td>
                    <td className="px-4 py-3 font-semibold">
                      {doctor[4]} Years
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-700">{doctor[5]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-1 text-[10px] font-bold ${doctor[6] === "Active" ? "bg-emerald-50 text-emerald-700" : doctor[6] === "On Leave" ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"}`}
                      >
                        {doctor[6]}
                      </span>
                    </td>
                    <td className="relative px-4 py-3">
                      <button
                        type="button"
                        onClick={(event) => {
                          if (openMenu === index) {
                            setOpenMenu(null);
                            setMenuPosition(null);
                            return;
                          }
                          const rect = event.currentTarget.getBoundingClientRect();
                          setMenuPosition({ top: rect.bottom + 8, left: rect.right - 112 });
                          setOpenMenu(index);
                        }}
                        className="cursor-pointer rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                      {openMenu === index && menuPosition && createPortal(
                        <div style={{ top: menuPosition.top, left: menuPosition.left }} className="fixed z-[9999] w-44 rounded-lg border border-slate-200 bg-white p-1 text-xs font-bold shadow-xl">
                          {[
                            [Eye, "View Details", "text-slate-600", () => openDetails(doctor[10])],
                            [Pencil, "Edit Doctor", "text-slate-600", () => openEdit(doctor[10])],
                            [CalendarDays, "Manage Schedule", "text-slate-600", () => openSchedule(doctor[10])],
                            [CalendarCheck, "View Appointments", "text-slate-600"],
                            [UserX, doctor[6] === "Inactive" ? "Activate Doctor" : "Deactivate Doctor", doctor[6] === "Inactive" ? "text-emerald-600" : "text-red-600", () => handleStatusChange(doctor[10], doctor[6] === "Inactive" ? "active" : "inactive")],
                          ].map(([Icon, label, tone, action]) => (
                            <button key={label} type="button" onClick={action} className={`flex w-full cursor-pointer items-center gap-2 rounded px-2 py-2 text-left hover:bg-slate-50 ${tone}`}>
                              <Icon className="size-4" />
                              {label}
                            </button>
                          ))}
                        </div>,
                        document.body,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-[11px] font-semibold text-slate-400">
            <span>
              Showing {visibleDoctors.length} of {doctors.length} doctors
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="cursor-pointer rounded border border-slate-200 p-1.5"
              >
                <ChevronLeft className="size-3" />
              </button>
              <span className="rounded bg-[#b40000] px-2.5 py-1.5 font-bold text-white">
                1
              </span>
              <button
                type="button"
                className="cursor-pointer rounded border border-slate-200 p-1.5"
              >
                <ChevronRight className="size-3" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};
