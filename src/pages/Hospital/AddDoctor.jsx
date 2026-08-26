import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {ArrowLeft,CalendarDays,Save,Stethoscope,UploadCloud} from "lucide-react";
import { createDoctor } from "../../api/hospitalApi";

const input ="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const AddDoctor = () => {
  const { setHeaderContent } = useOutletContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "KHIZAR",
    email: "khizar123@gmail.com",
    phoneNumber: "9922200309",
    gender: "male",
    dateOfBirth: "",
    department: "Cardiologist",
    specialization: "surgeon",
    qualifications: "MBBS MD",
    experience: "5",
    registrationNumber: "MMC_100",
    consultationFee: "500",
    appointmentDuration: "10",
    status: "active",
  });
  const [schedule, setSchedule] = useState(
    days.map((day) => ({
      day,
      isAvailable: !["Sunday"].includes(day),
      shifts: [{ startTime: "10:00", endTime: "02:00" }],
    })),
  );

  const [profileFile, setProfileFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  
  useEffect(
    () =>
      setHeaderContent({
        title: "Add Doctor",
        subtitle:"Add a doctor to your hospital and manage their availability.",
        action: undefined,
      }),
    [setHeaderContent],
  );
  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const updateDay = (index, changes) =>
    setSchedule((current) =>
      current.map((day, i) => (i === index ? { ...day, ...changes } : day)),
    );
  const updateShift = (dayIndex, shiftIndex, changes) =>
    setSchedule((current) =>
      current.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              shifts: day.shifts.map((shift, j) =>
                j === shiftIndex ? { ...shift, ...changes } : shift,
              ),
            }
          : day,
      ),
    );
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createDoctor({
        ...form,
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee || 0),
        qualifications: form.qualifications
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        availability: schedule,
      }, profileFile);
      navigate("/hospital/doctors");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add doctor.");
    } finally {
      setSaving(false);
    }
  };
  const field = (name, label, placeholder, required = false, type = "text") => (
    <label className="text-xs font-bold text-slate-700">
      {label}
      {required && <span className="text-red-500"> *</span>}
      <input
        required={required}
        type={type}
        name={name}
        value={form[name]}
        onChange={update}
        placeholder={placeholder}
        className={input}
      />
    </label>
  );
  return (
    <section className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-slate-50 via-white to-blue-50/40 px-3 py-5 sm:px-6">
      <form onSubmit={save} className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
          <div>
            <Link
              to="/hospital/doctors"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="size-4" /> Back to Doctors
            </Link>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
              Add Doctor
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create a doctor profile and set their weekly appointment schedule.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/hospital/doctors"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              disabled={saving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
            >
              <Save className="size-4" />
              {saving ? "Saving..." : "Save Doctor"}
            </button>
          </div>
        </header>
        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
            {error}
          </p>
        )}
        <div className="grid gap-5 lg:grid-cols-2">
          <Card
            title="Basic Information"
            icon={<Stethoscope className="size-5" />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {field("name", "Full Name", "Enter doctor full name", true)}
              <label className="text-xs font-bold text-slate-700">
                Profile Photo
                <span className="relative mt-1.5 flex h-[86px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-center transition hover:border-blue-400 hover:bg-blue-50/30">
                  <UploadCloud className="size-7 text-blue-500" />
                  <span className="mt-1 text-xs font-bold text-blue-600">
                    {profileFile ? profileFile.name : "Upload Photo"}
                  </span>
                  <span className="mt-0.5 text-[10px] font-medium text-slate-400">
                    JPG, PNG or WEBP (Max. 2MB)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      setProfileFile(event.target.files?.[0] || null)
                    }
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </span>
              </label>
              {field("email", "Email", "Enter email address", false, "email")}
              {field("phoneNumber", "Phone Number", "Enter phone number", true)}
              <label className="text-xs font-bold text-slate-700">
                Gender
                <select
                  name="gender"
                  value={form.gender}
                  onChange={update}
                  className={input}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
              {field(
                "dateOfBirth",
                "Date of Birth",
                "Select date",
                false,
                "date",
              )}
            </div>
          </Card>
          <Card
            title="Professional Information"
            icon={<span className="text-violet-600">♙</span>}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {field("department", "Department", "Select department", true)}
              {field(
                "specialization",
                "Specialization",
                "Enter specialization",
                true,
              )}
              <label className="text-xs font-bold text-slate-700 sm:col-span-2">
                Qualifications
                <input
                  name="qualifications"
                  value={form.qualifications}
                  onChange={update}
                  placeholder="Enter qualifications (e.g. MBBS, MD, DM)"
                  className={input}
                />
              </label>
              {field(
                "experience",
                "Experience (Years)",
                "Enter experience",
                true,
                "number",
              )}
              {field(
                "registrationNumber",
                "Registration Number",
                "Enter registration number",
              )}
              {field(
                "consultationFee",
                "Consultation Fee (₹)",
                "Enter consultation fee",
                false,
                "number",
              )}
              <label className="text-xs font-bold text-slate-700">
                Appointment Duration
                <select
                  name="appointmentDuration"
                  value={form.appointmentDuration}
                  onChange={update}
                  className={input}
                >
                  <option value="30">10 Minutes</option>
                  <option value="45">15 Minutes</option>
                  <option value="60">20 Minutes</option>
                </select>
              </label>
            </div>
          </Card>
        </div>
        <Card
          title="Availability & Schedule"
          icon={<CalendarDays className="size-5" />}
        >
          <p className="mb-4 rounded-xl bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-700">
            Set the days and time slots when the doctor is available.
          </p>
          <div className="space-y-2">
            {schedule.map((day, dayIndex) => (
              <div
                key={day.day}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex w-32 items-center gap-2 text-sm font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={day.isAvailable}
                      onChange={(event) =>
                        updateDay(dayIndex, {
                          isAvailable: event.target.checked,
                        })
                      }
                    />
                    {day.day}
                  </label>
                  {day.isAvailable ? (
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                      {day.shifts.map((shift, shiftIndex) => (
                        <div
                          key={shiftIndex}
                          className="flex items-center gap-2"
                        >
                          <span className="text-xs font-semibold text-slate-500">
                            From
                          </span>
                          <input
                            type="time"
                            value={shift.startTime}
                            onChange={(event) =>
                              updateShift(dayIndex, shiftIndex, {
                                startTime: event.target.value,
                              })
                            }
                            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold"
                          />
                          <span className="text-xs font-bold text-slate-400">
                            to
                          </span>
                          <input
                            type="time"
                            value={shift.endTime}
                            onChange={(event) =>
                              updateShift(dayIndex, shiftIndex, {
                                endTime: event.target.value,
                              })
                            }
                            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          updateDay(dayIndex, {
                            shifts: [
                              ...day.shifts,
                              { startTime: "18:00", endTime: "20:00" },
                            ],
                          })
                        }
                        className="cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-800"
                      >
                        + Add Slot
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">
                      Not available
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Status">
          <label className="block max-w-xs text-xs font-bold text-slate-700">
            Doctor Status <span className="text-red-500">*</span>
            <select
              required
              name="status"
              value={form.status}
              onChange={update}
              className={input}
            >
              <option value="active">● Active</option>
              <option value="inactive">● Inactive</option>
              <option value="on_leave">● On Leave</option>
            </select>
            <span className="mt-1.5 block text-[11px] font-medium text-slate-400">
              Active doctors are visible and can receive appointments.
            </span>
          </label>
        </Card>
      </form>
    </section>
  );
};

const Card = ({ title, icon, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
    <h2 className="mb-5 flex items-center gap-3 text-base font-extrabold text-slate-900">
      {icon && (
        <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </span>
      )}
      {title}
    </h2>
    {children}
  </section>
);
