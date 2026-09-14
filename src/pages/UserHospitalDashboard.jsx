import { useEffect, useState } from "react";
import {AlertCircle,BadgeCheck,BedDouble,Building2,CalendarCheck,Clock3,LoaderCircle,MapPin,Navigation,Phone,Siren,Stethoscope,UserRound,Wrench} from "lucide-react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {getPublicHospitalDoctors,getPublicHospitalServicesFacilities,getPublicHospitalById} from "../api/hospitalApi.js";
import { BookAppointment } from "../api/appointmentApi.js";

const hasValue = (value) =>
  value !== undefined && value !== null && value !== "";

const formatLabel = (value) =>
  String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
const getTodayName = () => new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
const formatTimeWithMeridiem = (time) => {
  const [hours, minutes] = String(time || "").split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time || "";
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
};
const formatWorkingHours = (shifts = []) => shifts.map((shift) => `${formatTimeWithMeridiem(shift.startTime)} - ${formatTimeWithMeridiem(shift.endTime)}`).join(", ");
const StatCard = ({ icon: Icon, label, value, detail, tone = "emerald" }) => (
  <div
    className={`flex items-center gap-3 rounded-xl border border-${tone}-100 bg-${tone}-50/60 p-3`}
  >
    <span
      className={`grid size-11 shrink-0 place-items-center rounded-xl bg-${tone}-100 text-${tone}-600`}
    >
      <Icon className="size-6" />
    </span>
    <div>
      <p className="text-xl font-extrabold leading-5 text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-extrabold text-slate-700">{label}</p>
      {detail && (
        <p className="text-[11px] font-semibold text-slate-500">{detail}</p>
      )}
    </div>
  </div>
);

export const HospitalPageView = () => {
  const { setHeaderContent } = useOutletContext();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("doctors");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointmentMessage, setAppointmentMessage] = useState("");
  const [appointmentBooked, setAppointmentBooked] = useState(false);

  useEffect(() => {
    setHeaderContent({
      title: "Hospital at a Glance",
      subtitle:
        "Everything you need to know about this hospital, all in one place",
    });
  }, [setHeaderContent]);

  const { hospitalId } = useParams();
  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const response = await getPublicHospitalById(hospitalId);
        setHospital(response?.hospital || null);
      } catch (err) {
        setError(err.message || "Unable to load hospital details.");
      } finally {
        setLoading(false);
      }
    };

    fetchHospital();
  }, [hospitalId]);

  const takeAppointment = async (doctorId) => {
    setAppointmentMessage("");
    setAppointmentBooked(false);

    try {
      await BookAppointment(doctorId);
      setAppointmentBooked(true);
      setAppointmentMessage("Your appointment booked successfully.");
    } catch (err) {
      setAppointmentMessage(
        err.response?.data?.message ||
          err.message ||
          "Unable to book appointment.",
      );
    }
  };

  useEffect(() => {
    if (activeTab !== "services") return;
    const fetchServices = async () => {
      setServicesLoading(true);
      try {
        const response = await getPublicHospitalServicesFacilities(hospitalId);
        setServices(response?.items || []);
      } catch {
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };
    fetchServices();
  }, [activeTab, hospitalId]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await getPublicHospitalDoctors(hospitalId);
        setDoctors(response?.doctors || []);
      } catch {
        setDoctors([]);
      } finally {
        setDoctorsLoading(false);
      }
    };

    fetchDoctors();
  }, [hospitalId]);
  if (loading)
    return (
      <div className="flex min-h-40 items-center justify-center text-sm font-bold text-slate-500">
        <LoaderCircle className="mr-2 size-5 animate-spin text-emerald-600" />
        Loading hospital...
      </div>
    );
  if (error || !hospital)
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
        <AlertCircle className="mr-2 inline size-4" />
        {error || "Hospital not found."}
      </div>
    );
  const beds = hospital.capacity?.beds || {};
  const bedGroups = [beds.general, beds.private].filter(
    (bed) => bed && (hasValue(bed.total) || hasValue(bed.occupied)),
  );
  const totalBeds = bedGroups.reduce(
    (sum, bed) => sum + (Number(bed.total) || 0),
    0,
  );
  const occupiedBeds = bedGroups.reduce(
    (sum, bed) => sum + (Number(bed.occupied) || 0),
    0,
  );
  const icu = beds.icu;
  const hasIcu = icu && (hasValue(icu.total) || hasValue(icu.occupied));
  const emergency = hospital.capacity?.emergencyStatus;
  const phone = hospital.phoneNumber || hospital.contactPerson?.phoneNumber;
  const address = hospital.address?.fullAddress;
  const coordinates = hospital.location?.coordinates;
  const hasCoordinates =
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    coordinates.every((coordinate) => Number.isFinite(Number(coordinate)));
  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${coordinates[1]},${coordinates[0]}`
    : "";
  return (
    <main className="min-h-full bg-[#f8fafc] px-3 py-4 text-slate-900 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1240px] space-y-3">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <div className="flex flex-wrap items-start gap-3">
            <span className="grid size-14 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Building2 className="size-7" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-950">
                  {hospital.name}
                </h1>
                {hospital.verificationStatus === "verified" && (
                  <BadgeCheck className="size-5 fill-emerald-500 text-white" />
                )}
              </div>
              {hasValue(hospital.hospitalType) && (
                <p className="mt-1 text-sm font-bold text-slate-500">
                  {formatLabel(hospital.hospitalType)} Hospital
                </p>
              )}
              <div className="mt-2 space-y-2 text-xs font-semibold text-slate-500">
                {address && (
                  <div className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-red-500" />
                    {address}
                  </div>
                )}
                {phone && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5">
                      <Phone className="size-4 shrink-0 text-red-500" />
                      {phone}
                    </span>
                    {directionsUrl && (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-[11px] font-extrabold text-white shadow-sm shadow-blue-200 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
                      >
                        <span className="grid size-5 place-items-center rounded-full bg-white/20 transition group-hover:bg-white/30">
                          <Navigation className="size-3" />
                        </span>
                        Get Directions
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        {(bedGroups.length > 0 || hasIcu || hasValue(emergency)) && (
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bedGroups.length > 0 && (
              <StatCard
                icon={BedDouble}
                label="Beds Available"
                value={Math.max(totalBeds - occupiedBeds, 0)}
                detail={`out of ${totalBeds} total`}
              />
            )}
            {hasIcu && (
              <StatCard
                icon={BedDouble}
                label="ICU Beds Available"
                value={Math.max(
                  (Number(icu.total) || 0) - (Number(icu.occupied) || 0),
                  0,
                )}
                detail={`out of ${icu.total ?? 0} total`}
                tone="violet"
              />
            )}
            {hasValue(emergency) && (
              <StatCard
                icon={Siren}
                label="Emergency"
                value={formatLabel(emergency)}
                detail={emergency === "available" ? "Open 24/7" : undefined}
                tone={emergency === "available" ? "emerald" : "amber"}
              />
            )}
          </section>
        )}
        {appointmentMessage && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            <BadgeCheck className="mr-2 inline size-4" />
            {appointmentMessage}
            {appointmentBooked && (
              <Link
                to="/appointments"
                className="ml-4 inline-flex rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-emerald-700"
              >
                See Appointment
              </Link>
            )}
          </div>
        )}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_5px_20px_rgba(15,23,42,0.04)]">
          <div className="grid grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveTab("doctors")}
              className={`group flex items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-extrabold transition hover:bg-blue-50 ${activeTab === "doctors" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}
            >
              <Stethoscope className="size-4 transition group-hover:scale-110" />
              Doctors
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("services")}
              className={`group flex items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-extrabold transition hover:bg-blue-50 ${activeTab === "services" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:border-blue-200 hover:text-blue-600"}`}
            >
              <Wrench className="size-4 transition group-hover:rotate-12" />
              Services &amp; Facilities
            </button>
          </div>
        </section>
        {activeTab === "doctors" ? (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_5px_20px_rgba(15,23,42,0.04)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-950">
                  Doctors
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Doctors associated with this hospital
                </p>
              </div>
              <Stethoscope className="size-5 text-blue-600" />
            </div>
            {doctorsLoading ? (
              <div className="flex min-h-24 items-center justify-center text-xs font-bold text-slate-500">
                <LoaderCircle className="mr-2 size-4 animate-spin text-blue-600" />
                Loading doctors...
              </div>
            ) : doctors.length === 0 ? (
              <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-xs font-semibold text-slate-500">
                No doctors available.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {doctors.map((doctor) => {
                  const todaySchedule = doctor.availability?.find((item) => item.day === getTodayName());
                  const isAvailableToday = doctor.status === "active" && todaySchedule?.isAvailable === true && todaySchedule.shifts?.length > 0;
                  const workingHours = formatWorkingHours(todaySchedule?.shifts);
                  return (
                  <article
                    key={doctor._id}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_14px_30px_rgba(37,99,235,0.12)]"
                  >
                    <div className="flex flex-col items-center text-center">
                      {doctor.profileImage ? (
                        <img
                          src={doctor.profileImage}
                          alt={doctor.name}
                          className="size-20 rounded-full object-cover ring-4 ring-slate-100 shadow-sm transition duration-200 group-hover:ring-blue-100"
                        />
                      ) : (
                        <span className="grid size-20 place-items-center rounded-full bg-slate-100 text-blue-600 ring-4 ring-slate-50 shadow-sm transition duration-200 group-hover:ring-blue-100">
                          <UserRound className="size-9" />
                        </span>
                      )}
                      <div className="mt-2 min-w-0 w-full">
                        <h3 className="truncate text-base font-extrabold tracking-tight text-slate-950">
                          Dr. {doctor.name}
                        </h3>
                        <p className="mt-1 truncate text-sm font-medium text-slate-500">
                          {doctor.specialization || doctor.department}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs">
                      <div>
                          <p className="font-semibold text-slate-400">
                          Experience
                        </p>
                          <p className="mt-1 text-sm font-extrabold text-slate-900">
                          {doctor.experience}{" "}
                          {Number(doctor.experience) === 1 ? "year" : "years"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-400">
                          Consultation Fee
                        </p>
                        <p className="mt-1 text-sm font-extrabold text-emerald-700">
                          ₹
                          {Number(doctor.consultationFee || 0).toLocaleString(
                            "en-IN",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-start gap-x-3 gap-y-1">
                      {isAvailableToday && <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"><Clock3 className="size-4 text-blue-500" />{workingHours}</p>}
                      
                    </div>
                    <button
                      type="button"
                      disabled={!isAvailableToday}
                      className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-extrabold transition focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 ${isAvailableToday ? "cursor-pointer border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white" : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"}`}
                      onClick={()=>takeAppointment(doctor._id)}
                    >
                      <CalendarCheck className="size-4 " />
                      {isAvailableToday ? "Book Appointment" : "Unavailable Today"}
                    </button>
                  </article>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_5px_20px_rgba(15,23,42,0.04)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-950">
                  Services &amp; Facilities
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Available services and facilities at this hospital
                </p>
              </div>
              <Wrench className="size-5 text-blue-600" />
            </div>
            {servicesLoading ? (
              <div className="flex min-h-24 items-center justify-center text-xs font-bold text-slate-500">
                <LoaderCircle className="mr-2 size-4 animate-spin text-blue-600" />
                Loading services...
              </div>
            ) : services.length === 0 ? (
              <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-xs font-semibold text-slate-500">
                No services or facilities available.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((item) => (
                  <article
                    key={item._id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >
                    <div className="h-28 bg-slate-100">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="grid size-full place-items-center text-blue-500">
                          <Wrench className="size-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-blue-600">
                        {item.type}
                      </span>
                      <h3 className="mt-1 text-sm font-extrabold text-slate-950">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
};
