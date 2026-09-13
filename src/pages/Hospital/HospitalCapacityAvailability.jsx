import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ArrowUp, BedDouble, Check, Clock3, Info, Pencil, Siren, X } from "lucide-react";
import { getMyHospitalProfile, updateMyCapacityBed, updateMyEmergencyStatus } from "../../api/hospitalApi";

const bedMeta = [
  { key: "general", category: "General Ward", description: "Standard shared rooms" },
  { key: "private", category: "Private Rooms", description: "Single/Deluxe rooms" },
  { key: "icu", category: "ICU", description: "Intensive Care Unit" },
];
const statusOptions = [
  {
    value: "Operational",
    description: "Emergency services are fully available.",
    color: "emerald",
  },
  {
    value: "Limited",
    description: "Emergency services are available with limitations.",
    color: "amber",
  },
  {
    value: "Unavailable",
    description: "Emergency services are temporarily unavailable.",
    color: "red",
  },
];

const SummaryCard = ({ icon: Icon, label, value, detail, color }) => (
  <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-[0_5px_20px_rgba(30,64,175,0.05)] sm:p-4">
    <div className="flex items-center gap-4">
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl bg-${color}-50 text-${color}-600`}
      >
        <Icon className="size-7" />
      </span>
      <div>
        <p className="text-sm font-bold text-slate-600">{label}</p>
        <p className="mt-1 text-[20px] font-extrabold leading-none text-slate-950">
          {value}
        </p>
        <p className="mt-1.5 text-xs font-semibold text-slate-500">{detail}</p>
      </div>
    </div>
  </div>
);

export const HospitalCapacityAvailability = () => {
  const { setHeaderContent } = useOutletContext();
  const [beds, setBeds] = useState([]);
  const [status, setStatus] = useState("Operational");
  const [editing, setEditing] = useState(null);
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [capacityError, setCapacityError] = useState("");
  const [savingBed, setSavingBed] = useState(null);
  useEffect(() => {
    setHeaderContent({
      title: "Capacity & Availability",
      subtitle:
        "Monitor and update your hospital's current resource and availability",
      action: undefined,
    });
    getMyHospitalProfile().then(({ hospital }) => {
      setBeds(bedMeta.map((item) => ({ ...item, total: hospital.capacity?.beds?.[item.key]?.total ?? 0, occupied: hospital.capacity?.beds?.[item.key]?.occupied ?? 0 })));
      const savedStatus = { available: "Operational", limited: "Limited", unavailable: "Unavailable" }[hospital.capacity?.emergencyStatus];
      if (savedStatus) setStatus(savedStatus);
    }).catch(() => {});
  }, [setHeaderContent]);
  const totals = useMemo(
    () =>
      beds.reduce(
        (r, b) => ({
          total: r.total + b.total,
          occupied: r.occupied + b.occupied,
        }),
        { total: 0, occupied: 0 },
      ),
    [beds],
  );
  const available = totals.total - totals.occupied;
  const icu = beds.find((bed) => bed.key === "icu") || { total: 0, occupied: 0 };
  const selected = statusOptions.find((item) => item.value === status);
  const updateBed = (index, field, value) =>
    setBeds((current) =>
      current.map((bed, i) =>
        i === index
          ? { ...bed, [field]: Math.max(0, Number(value) || 0) }
          : bed,
      ),
    );
  const selectStatus = async (nextStatus) => {
    const apiStatus = { Operational: "available", Limited: "limited", Unavailable: "unavailable" }[nextStatus];
    setStatusError("");
    setSavingStatus(true);
    try {
      await updateMyEmergencyStatus(apiStatus);
      setStatus(nextStatus);
      setShowStatusOptions(false);
    } catch (error) {
      setStatusError(error.response?.data?.message || "Unable to update status");
    } finally {
      setSavingStatus(false);
    }
  };
  const saveBed = async (index) => {
    const bed = beds[index];
    setCapacityError(""); setSavingBed(index);
    try { await updateMyCapacityBed({ category: bed.key, total: bed.total, occupied: bed.occupied }); setEditing(null); }
    catch (error) { setCapacityError(error.response?.data?.message || "Unable to update bed capacity"); }
    finally { setSavingBed(null); }
  };
  return (
    <main className="min-h-full bg-[#f8fafc] px-3 py-4 text-slate-900 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1240px] space-y-4">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={BedDouble}
            label="Total Beds"
            value={totals.total}
            detail="Across all categories"
            color="red"
          />
          <SummaryCard
            icon={BedDouble}
            label="Available Beds"
            value={available}
            detail={<span className="inline-flex items-center gap-1 text-emerald-700"><ArrowUp className="size-3.5" strokeWidth={3} />{((available / totals.total) * 100).toFixed(1)}% available</span>}
            color="emerald"
          />
          <SummaryCard
            icon={BedDouble}
            label="ICU Beds"
            value={`${icu.occupied} / ${icu.total}`}
            detail="Available / Total"
            color="violet"
          />
          <SummaryCard
            icon={Siren}
            label="Emergency"
            value={status}
            detail={
              status === "Operational"
                ? "Open 24/7"
                : "Status requires attention"
            }
            color="blue"
          />
        </section>
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(290px,1fr)]">
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_5px_20px_rgba(30,64,175,0.05)]">
            <div className="flex items-center gap-3 px-5 pb-4 pt-5 sm:px-6">
              <span className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-500">
                <BedDouble className="size-6" />
              </span>
              <div>
                <h2 className="text-base font-extrabold">Bed Capacity</h2>
                <p className="text-sm font-medium text-slate-500">
                  View and manage bed availability across different categories
                </p>
              </div>
            </div>
            <div className="hidden grid-cols-[1.35fr_.65fr_.65fr_.65fr_1.25fr_.65fr] gap-3 bg-slate-50 px-6 py-3 text-xs font-extrabold text-slate-500 sm:grid">
              <span>Category</span>
              <span>Total Beds</span>
              <span>Occupied</span>
              <span>Available</span>
              <span>Occupancy</span>
              <span>Action</span>
            </div>
            <div className="divide-y divide-slate-100 px-5 sm:px-6">
              {beds.map((bed, index) => {
                const free = bed.total - bed.occupied;
                const occupancy = bed.total
                  ? Math.round((bed.occupied / bed.total) * 100)
                  : 0;
                const bar =
                  occupancy >= 80
                    ? "bg-red-500"
                    : occupancy >= 75
                      ? "bg-emerald-500"
                      : "bg-amber-400";
                return (
                  <div
                    key={bed.category}
                    className="grid gap-2.5 py-4 sm:grid-cols-[1.35fr_.65fr_.65fr_.65fr_1.25fr_.65fr] sm:items-center"
                  >
                    <div>
                      <p className="font-bold text-sm">{bed.category}</p>
                      <p className="text-xs font-medium text-slate-500">
                        {bed.description}
                      </p>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-xs text-slate-500 sm:hidden">
                        Total beds
                      </span>
                      <strong className="text-sm">
                        {editing === index ? (
                          <input
                            className="w-16  rounded border px-2 py-1"
                            type="number"
                            value={bed.total}
                            onChange={(e) =>
                              updateBed(index, "total", e.target.value)
                            }
                          />
                        ) : (
                          bed.total
                        )}
                      </strong>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-xs text-slate-500 sm:hidden">
                        Occupied
                      </span>
                      <strong className="text-sm">
                        {editing === index ? (
                          <input
                            className="w-16 rounded border px-2 py-1"
                            type="number"
                            value={bed.occupied}
                            onChange={(e) =>
                              updateBed(index, "occupied", e.target.value)
                            }
                          />
                        ) : (
                          bed.occupied
                        )}
                      </strong>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-xs text-slate-500 sm:hidden">
                        Available
                      </span>
                      <strong className="text-emerald-600 text-sm">{free}</strong>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <span
                            className={`block h-full rounded-full ${bar}`}
                            style={{ width: `${Math.min(100, occupancy)}%` }}
                          />
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {occupancy}%
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        editing === index ? saveBed(index) : setEditing(index)
                      }
                      disabled={savingBed === index}
                      className="inline-flex  cursor-pointer w-fit items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold hover:border-red-300 hover:text-red-600"
                    >
                      <Pencil className="size-4" />
                      {savingBed === index ? "Saving..." : editing === index ? "Save" : "Edit"}
                    </button>
                  </div>
                );
              })}
            </div>
            {capacityError && <p className="px-4 pb-3 text-xs font-bold text-red-600">{capacityError}</p>}
          </div>
          <aside className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_5px_20px_rgba(30,64,175,0.05)] sm:p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-red-50 text-red-500">
                <Siren className="size-5" />
              </span>
              <div>
                <h2 className="text-base font-extrabold">Emergency Department</h2>
                <p className="text-xs font-medium text-slate-500">
                  Update the current status of your emergency services
                </p>
              </div>
            </div>
            <div
              className={`mt-4 flex items-center gap-3 rounded-xl border border-${selected.color}-100 bg-${selected.color}-50 p-4`}
            >
              <span
                className={`size-4 rounded-full bg-${selected.color}-500`}
              />
              <div>
                <p
                  className={`text-[1rem] font-extrabold text-${selected.color}-700`}
                >
                  {status}
                </p>
                <p className="text-xs font-medium text-slate-500">
                  Emergency services are currently available
                </p>
              </div>
              <span className="ml-auto rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold text-slate-600">
                {status === "Operational" ? "Open 24/7" : "Review"}
              </span>
            </div>
            <button type="button" onClick={() => setShowStatusOptions((visible) => !visible)} className="mt-4 cursor-pointer flex w-full items-center gap-2 rounded-xl border border-red-300 px-4 py-3 text-sm font-extrabold text-red-600">
              <Pencil className="size-4" />
              Change Status
            </button>
          </aside>
        </section>
        {showStatusOptions && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4" onClick={() => !savingStatus && setShowStatusOptions(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="emergency-status-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4"><div><h3 id="emergency-status-title" className="text-lg font-extrabold text-slate-900">Change Emergency Status</h3><p className="mt-1 text-xs font-medium text-slate-500">Select the current availability of emergency services.</p></div><button type="button" aria-label="Close status dialog" onClick={() => setShowStatusOptions(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="size-5" /></button></div>
            <div className="mt-5 space-y-3">{statusOptions.map((option) => <button type="button" key={option.value} disabled={savingStatus} onClick={() => selectStatus(option.value)} className="flex w-full items-start gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-red-200 hover:bg-red-50/30 disabled:opacity-60"><span className={`mt-0.5 grid size-5 place-items-center rounded-full border-2 ${status === option.value ? `border-${option.color}-500` : "border-slate-300"}`}>{status === option.value && <Check className={`size-3 text-${option.color}-600`} strokeWidth={4} />}</span><span><span className={`block font-extrabold ${status === option.value ? `text-${option.color}-700` : "text-slate-800"}`}>{option.value}</span><span className="block text-xs font-medium text-slate-500">{option.description}</span></span></button>)}</div>
            {statusError && <p className="mt-3 text-xs font-bold text-red-600">{statusError}</p>}
          </div>
        </div>}
      </div>
    </main>
  );
};
