import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {Building2,CalendarDays,Clock,FileBadge,FileText,Hospital,LoaderCircle,LockKeyhole,MapPin,Phone,ShieldCheck,UserRound} from "lucide-react";
import { getMyHospitalProfile, updateMyHospitalProfile } from "../../api/hospitalApi";

const text = (value) => value || "Unavailable";

const statusStyles = {
  approved: "border-emerald-100 bg-emerald-50 text-emerald-700",
  pending: "border-amber-100 bg-amber-50 text-amber-700",
  rejected: "border-red-100 bg-red-50 text-red-700",
  suspended: "border-zinc-200 bg-zinc-100 text-zinc-700",
};


const Locked = ({ icon: Icon, label, value: item, wide }) => (
  <div
    className={`flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50/70 p-3 ${wide ? "sm:col-span-2" : ""}`}
  >
    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-zinc-500">
      <Icon className="size-5" />
    </span>
    <div className="min-w-0">
      <p className="text-[11px] font-extrabold uppercase text-zinc-400">
        {label}
      </p>
      <p className={`mt-1 text-xs font-extrabold text-zinc-800 ${wide ? "break-words whitespace-normal" : "whitespace-nowrap"}`}>
        {text(item)}
      </p>
    </div>
  </div>
);

const Field = ({ icon: Icon, label, value, name, editing, onChange, type = "text" }) => (
  <label className="block text-xs font-extrabold text-zinc-500">
    <span className="mb-2 flex items-center gap-2">
      {Icon ? <Icon className="size-4" /> : null}
      {label}
    </span>
    <input
      readOnly={!editing}
      type={type}
      name={name}
      onChange={onChange}
      value={editing ? (value ?? "") : text(value)}
      className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-700 outline-none"
    />
  </label>
);

export const HospitalProfile = () => {
  const { setHeaderContent, user } = useOutletContext();
  const [hospital, setHospital] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ contactPersonName: "", phoneNumber: "", openingTime: "10:00", closingTime: "22:00", isOpen24Hours: false });
  useEffect(() => {
    setHeaderContent({
      title: "Hospital Profile",
      subtitle:
        "Manage your hospital information, registration, and contact details",
      action: undefined,
    });
    getMyHospitalProfile()
      .then((response) => { setHospital(response.hospital); setForm({ contactPersonName: response.hospital.contactPerson?.name || user?.username || "", phoneNumber: response.hospital.contactPerson?.phoneNumber || response.hospital.phoneNumber || user?.phoneNumber || "", openingTime: "10:00", closingTime: "22:00", isOpen24Hours: false, ...(response.hospital.workingHours || {}) }); })
      .catch((err) =>
        setError(err.message || "Unable to load hospital profile"),
      );
  }, [setHeaderContent]);
  if (error)
    return (
      <p className="m-4 rounded-lg bg-red-50 p-4 text-sm font-bold text-red-600">
        {error}
      </p>
    );
  if (!hospital)
    return (
      <div className="grid min-h-[360px] place-items-center">
        <LoaderCircle className="size-6 animate-spin text-[#fb2c36]" />
      </div>
    );
  const status = hospital.accountStatus || "pending";
  const [longitude, latitude] = hospital.location?.coordinates || [];
  const handleCancel = () => {
    setForm({ contactPersonName: hospital.contactPerson?.name || user?.username || "", phoneNumber: hospital.contactPerson?.phoneNumber || hospital.phoneNumber || user?.phoneNumber || "", openingTime: "10:00", closingTime: "22:00", isOpen24Hours: false, ...(hospital.workingHours || {}) });
    setError("");
    setSuccess("");
    setEditing(false);
  };
  const handleSave = async () => {
    if (!form.contactPersonName.trim() || !form.phoneNumber.trim()) return setError("Contact person and phone number are required.");
    if (!form.isOpen24Hours && (!form.openingTime || !form.closingTime)) return setError("Opening and closing time are required unless the hospital is open 24 hours.");
    try { const response = await updateMyHospitalProfile(form); setHospital(response.hospital); setEditing(false); setError(""); setSuccess(response.message || "Hospital profile updated successfully"); } catch (err) { setSuccess(""); setError(err.message || "Unable to update hospital profile"); }
  };
  return (
    <div className="space-y-3 py-2">
      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 bg-[linear-gradient(135deg,#fff7f7_0%,#ffffff_55%,#f8fafc_100%)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-20 shrink-0 place-items-center rounded-full border-4 border-white bg-[#fb2c36] text-white shadow-md">
              <Hospital className="size-9" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-extrabold text-zinc-950">
                  {hospital.name}
                </h2>
                <span
                  className={`rounded-full border px-3 py-1 text-[11px] font-extrabold ${statusStyles[status] || statusStyles.pending}`}
                >
                  {status}
                </span>
              </div>
          <p className="mt-1 text-xs font-semibold text-zinc-600">
                Hospital profile and registration details
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700">
                  <Phone className="mr-2 inline size-3.5 text-[#fb2c36]" />
                  {text(hospital.phoneNumber)}
                </span>
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700">
                  <MapPin className="mr-2 inline size-3.5 text-[#fb2c36]" />
                  {text(hospital.address?.city)}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:w-72">
            <Locked label="Status" value={status} icon={ShieldCheck} />
            <Locked
              label="Verification"
              value={hospital.verificationStatus}
              icon={FileBadge}
            />
          </div>
        </div>
      </section>
      {success ? <p className="rounded-md bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">{success}</p> : null}
      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-5">
          <div>
          <h3 className="text-lg font-extrabold text-zinc-950">
            Profile Information
          </h3>
          <p className="mt-1 text-xs font-semibold text-zinc-500">
            Contact details and registration information for your hospital.
          </p>
          </div>
          {editing ? <div className="flex gap-2"><button type="button" onClick={handleCancel} className="h-9 cursor-pointer rounded-md border border-zinc-200 bg-white px-4 text-xs font-extrabold text-zinc-700">Cancel</button><button type="button" onClick={handleSave} className="h-9 cursor-pointer rounded-md bg-zinc-950 px-4 text-xs font-extrabold text-white">Save</button></div> : <button type="button" onClick={() => { setError(""); setSuccess(""); setEditing(true); }} className="h-9 cursor-pointer rounded-md bg-zinc-950 px-4 text-xs font-extrabold text-white">Edit Details</button>}
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-4">
            <h4 className="text-sm font-extrabold text-zinc-950">
              Editable Details
            </h4>
            <div className="mt-4 space-y-4">
              <Field
                icon={UserRound}
                label="Contact Person"
                name="contactPersonName" value={form.contactPersonName} editing={editing} onChange={(event) => setForm({ ...form, contactPersonName: event.target.value })}
              />
              <Field
                icon={Phone}
                label="Phone Number"
                name="phoneNumber" value={form.phoneNumber} editing={editing} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
              />
              <div className="rounded-lg border border-red-100 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="flex items-center gap-2 text-base font-extrabold text-zinc-950"><Clock className="size-4 text-[#fb2c36]" />Working Hours</h4>
                  <span className="text-xs font-extrabold text-zinc-600"><input type="checkbox" checked={Boolean(form.isOpen24Hours)} disabled={!editing} onChange={(event) => setForm({ ...form, isOpen24Hours: event.target.checked, openingTime: "", closingTime: "" })} className="mr-2 size-4 align-middle" />Open 24 hours</span>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Opening Time" name="openingTime" type="time" value={form.openingTime || ""} editing={editing && !form.isOpen24Hours} onChange={(event) => setForm({ ...form, openingTime: event.target.value })} />
                  <Field label="Closing Time" name="closingTime" type="time" value={form.closingTime || ""} editing={editing && !form.isOpen24Hours} onChange={(event) => setForm({ ...form, closingTime: event.target.value })} />
                </div>
              </div>
            </div>
          </section>
          <section className="rounded-lg border border-zinc-100 bg-white p-4">
            <h4 className="flex items-center gap-2 text-xs font-extrabold text-zinc-950">
              <LockKeyhole className="size-5 text-zinc-500" />
              Locked Registration Details
            </h4>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Locked
                icon={Building2}
                label="Hospital Name"
                value={hospital.name}
              />
              <Locked
                icon={FileBadge}
                label="Registration Number"
                value={hospital.registrationNumber}
              />
              <Locked
                icon={ShieldCheck}
                label="Approval Status"
                value={status}
              />
              <Locked
                icon={MapPin}
                label="Exact Map Location"
                value="Locked after verification"
              />
              <Locked
                icon={MapPin}
                label="Registered Address"
                value={[
                  hospital.address?.fullAddress,
                  hospital.address?.city,
                  hospital.address?.state,
                ]
                  .filter(Boolean)
                  .join(", ")}
                wide
              />
            </div>
            <div className="mt-4 rounded-lg border border-red-100 bg-red-50/40 p-3">
              <h4 className="flex items-center gap-2 text-sm font-extrabold">
                <FileText className="size-4 text-[#fb2c36]" />
                Registration Document
              </h4>
              {hospital.registrationDocumentUrl ? (
                <a
                  href={hospital.registrationDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex rounded-md border border-red-100 bg-white px-4 py-2 text-xs font-extrabold text-[#fb2c36]"
                >
                  View Document
                </a>
              ) : (
                <p className="mt-2 text-xs font-bold text-zinc-500">
                  Unavailable
                </p>
              )}
            </div>
          </section>
        </div>
        <div className="hidden">
        <div className="mt-7 rounded-lg border border-zinc-100 p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-extrabold">
            <MapPin className="size-4 text-[#fb2c36]" />
            Hospital Location
          </h4>
          {latitude && longitude ? (
            <div className="h-56 overflow-hidden rounded-lg">
              <iframe
                title="Hospital location"
                className="h-full w-full border-0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`}
              />
            </div>
          ) : (
            <p className="text-sm font-bold text-zinc-500">
              Location unavailable
            </p>
          )}
        </div>
        </div>
      </section>
    </div>
  );
};
