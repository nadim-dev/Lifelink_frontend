import { useEffect, useState } from "react";
import {Search,UsersRound,MapPin,LoaderCircle,AlertCircle,Droplet} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { getNearByDonors, sendWhatsappSms } from "../api/donorApi";
import axios from "axios";

export const NearByDonor = () => {
  const { setHeaderContent } = useOutletContext();
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [radius, setRadius] = useState("10 km");
  const [donors, setDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sendingDonorId, setSendingDonorId] = useState(null);

  useEffect(() => {
    setHeaderContent({
      title: "Nearby Donors",
      subtitle: "Find eligible blood donors near you.",
      action: undefined,
    });
  }, [setHeaderContent]);

  const findDonors = async (event) => {
    event.preventDefault();
    if (!bloodGroup) return;
    try {
      setIsLoading(true);
      setError("");
      const response = await getNearByDonors({
        params: { bloodGroup, radius: Number.parseInt(radius, 10) },
      });
      setDonors(response?.data?.donors || response?.donors || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Unable to find donors right now.",
      );
      setDonors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage=async (payload)=>{
    try {
      setSendingDonorId(payload.donorId);
      setError("");
      await sendWhatsappSms(payload);
      const contactedUntil = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
      setDonors((current) => current.map((donor) =>
        donor._id === payload.donorId ? { ...donor, contactedUntil } : donor,
      ));
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to contact this donor right now.");
    } finally {
      setSendingDonorId(null);
    }
  }

  return (
    <main className="px-2 py-4 sm:px-4">
      <section className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-red-100 bg-gradient-to-br from-white via-white to-red-50/70 p-5 shadow-[0_12px_30px_rgba(217,4,41,0.07)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-red-100/50 blur-3xl" />
        <div className="relative">
          <div className="flex items-start gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-red-50 text-xl shadow-inner shadow-red-100">
              💧
            </span>
            <div>
              <h4 className="mt-0.5 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                What blood do you need?
              </h4>
            </div>
          </div>
          <p className="mt-2 max-w-2xl text-xs font-semibold leading-5 text-slate-500 sm:text-sm">
            Select a blood group and search radius to find eligible donors near you.
          </p>
          <form
            onSubmit={findDonors}
            className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
          >
            <label>
              <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                Blood group
              </span>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#D90429] focus:ring-4 focus:ring-red-100"
              >
                <option value="">Select blood group</option>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                  (group) => (
                    <option key={group}>{group}</option>
                  ),
                )}
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                Search radius
              </span>
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#D90429] focus:ring-4 focus:ring-red-100"
              >
                {["5 km", "10 km", "25 km", "50 km"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={!bloodGroup || isLoading}
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#D90429] px-5 text-sm font-black text-white shadow-md shadow-red-200 transition hover:bg-[#b80322] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <Search className="size-3.5" />
              )}
              Find Donors
            </button>
          </form>
        </div>
      </section>
      {error && (
        <div className="mx-auto mt-4 max-w-5xl rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          <AlertCircle className="mr-2 inline size-4" />
          {error}
        </div>
      )}
      {donors.length > 0 && (
        <section className="mx-auto mt-5 max-w-5xl space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-black text-slate-800">
              {donors.length} donors found for{" "}
              <span className="text-[#D90429]">{bloodGroup}</span> blood
            </p>
            
          </div>
          {donors.map((donor) => (
            <article
              key={donor._id}
              className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.05)] sm:grid-cols-[minmax(280px,1.35fr)_minmax(210px,0.9fr)_220px] sm:items-center sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-red-50 text-[#D90429] ring-4 ring-red-50">
                  {donor.picture ? (
                    <img
                      src={donor.picture}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <UsersRound className="size-5" />
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-lg font-black tracking-tight text-slate-900">
                    {donor.fullName || "Available donor"}
                  </p>
                  <p className="text-sm font-semibold text-slate-500">
                    {donor.gender || "Donor"}
                    {donor.age ? ` • ${donor.age} years` : ""}
                  </p>
                  <span className="mt-1.5 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-black text-emerald-600">
                    ● Available to donate
                  </span>
                 
                </div>
              </div>
              <div className="space-y-3 border-t border-slate-100 pt-4 sm:border-l sm:border-t-0 sm:pl-7 sm:pt-0">
                <p className="flex items-center gap-2 text-base font-black text-slate-700">
                  <MapPin className="size-4 text-slate-500" />
                  {donor.distance} km away
                </p>
                <p className="ml-6 -mt-2 text-xs font-semibold text-slate-400">
                  from your location
                </p>
                 <p className="text-sm font-semibold text-slate-600">
                    <Droplet className="mr-1.5 inline size-3.5 text-[#D90429]" />
                    Last donated:{" "}
                    {donor.lastDonationDate
                      ? new Date(donor.lastDonationDate).toLocaleDateString()
                      : "Not available"}
                  </p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-stretch sm:pl-2">
                <span className="inline-flex h-11 items-center justify-center gap-1 rounded-xl border border-red-300 px-3 text-base font-black text-[#D90429]">
                  <Droplet className="size-3.5 fill-current" />
                  {donor.bloodGroup}
                </span>
                <button
                  type="button"
                  disabled={Boolean(donor.contactedUntil) || sendingDonorId === donor._id}
                  className="inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#D90429] px-3 text-sm font-black text-white transition hover:bg-[#b80322] disabled:cursor-not-allowed disabled:bg-slate-300"
                  onClick={()=>{sendMessage({donorId:donor._id,distance:donor.distance})}}
                >
                  <Droplet className="size-3.5 fill-current" />
                  {sendingDonorId === donor._id
                    ? "Sending..."
                    : donor.contactedUntil
                      ? "Contacted recently"
                      : "Request Blood"}
                </button>
                {donor.contactedUntil && (
                  <p className="text-center text-xs font-bold text-slate-500">
                    Available again at {new Date(donor.contactedUntil).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </p>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};
