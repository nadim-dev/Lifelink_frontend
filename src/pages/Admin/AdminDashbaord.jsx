import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Building2,
  Droplet,
  LoaderCircle,
  Truck,
  Users,
  UserRound,
} from "lucide-react";
import {
  getAdminDashboardStats,
  getPendingRegistrations,
  getSupportTicketStats,
  getEnquiryStats,
  getPlatformGrowth,
} from "../../api/adminApi";

const cards = [
  {
    key: "users",
    label: "Total Users",
    icon: Users,
    card: "border-red-100 bg-red-50/40",
    iconTone: "bg-red-100 text-red-600",
  },
  {
    key: "bloodBanks",
    label: "Blood Banks",
    icon: Droplet,
    card: "border-rose-100 bg-rose-50/40",
    iconTone: "bg-rose-100 text-rose-600",
  },
  {
    key: "hospitals",
    label: "Hospitals",
    icon: Building2,
    card: "border-blue-100 bg-blue-50/40",
    iconTone: "bg-blue-100 text-blue-600",
  },
  {
    key: "deliveryPartners",
    label: "Delivery Partners",
    icon: Truck,
    card: "border-emerald-100 bg-emerald-50/40",
    iconTone: "bg-emerald-100 text-emerald-600",
  },
];

export const AdminDashbaordDetails = () => {
  const { setHeaderContent } = useOutletContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [ticketStats, setTicketStats] = useState({});
  const [enquiryStats, setEnquiryStats] = useState({});
  const [growth, setGrowth] = useState([]);
  const [growthRange, setGrowthRange] = useState("6m");

  useEffect(() => {
    setHeaderContent({
      title: "Admin Dashboard",
      subtitle:
        "Monitor platform activity and manage users, partners, hospitals, and blood banks",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        const [
          statsResponse,
          registrationsResponse,
          ticketsResponse,
          enquiriesResponse,
        ] = await Promise.all([
          getAdminDashboardStats(),
          getPendingRegistrations(),
          getSupportTicketStats(),
          getEnquiryStats(),
        ]);
        setStats(statsResponse?.stats || {});
        setPendingRegistrations(
          registrationsResponse?.pendingRegistrations || [],
        );
        setTicketStats(ticketsResponse?.stats || {});
        setEnquiryStats(enquiriesResponse?.stats || {});
      } catch {
        setStats({});
      }
    };

    loadDashboardStats();
  }, []);

  useEffect(() => {
    const loadGrowth = async () => {
      try {
        const response = await getPlatformGrowth(growthRange);
        setGrowth(Array.isArray(response) ? response : response?.data || []);
      } catch {
        setGrowth([]);
      }
    };
    loadGrowth();
  }, [growthRange]);

  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, label, icon: Icon, card, iconTone }) => {
          const item = stats?.[key];
          return (
            <article
              key={key}
              className={`flex min-h-[88px] items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm ${card}`}
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconTone}`}
              >
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-700">
                  {label}
                </p>
                <p className="mt-0.5 text-2xl font-extrabold leading-none text-slate-950">
                  {item ? (
                    item.total.toLocaleString()
                  ) : (
                    <LoaderCircle className="size-6 animate-spin text-slate-400" />
                  )}
                </p>
                <p className="mt-1 text-[11px] font-bold text-emerald-600">
                  {key === "users"
                    ? `↑ ${item?.active ?? 0} Active`
                    : `${item?.active ?? 0} Active`}{" "}
                  <span className="ml-2 text-red-500">
                    {item?.pending ?? 0} Pending
                  </span>
                </p>
              </div>
            </article>
          );
        })}
      </section>
      <section className="mt-4 grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2">
        <article className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <UserRound className="size-4 text-red-500" />
              Pending Registrations
            </h2>
            <button
              onClick={() => navigate("/admin/hospitals")}
              className="text-xs font-extrabold cursor-pointer text-red-600"
            >
              View All →
            </button>
          </div>
          {pendingRegistrations.map((registration) => (
            <div
              key={`${registration.type}-${registration.id}`}
              className="flex items-center gap-3 border-b border-slate-100 px-4 py-2.5 last:border-0"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                <Building2 className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-800">
                  {registration.name}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  {registration.type}
                </p>
              </div>
              <span className="hidden text-[11px] text-slate-400 sm:block">
                {new Date(registration.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() =>
                  navigate(
                    registration.type.startsWith("Blood")
                      ? `/admin/blood-bank/${registration.id}`
                      : registration.type.startsWith("Hospital")
                        ? `/admin/hospitals/${registration.id}`
                        : `/admin/delivery-partners/${registration.id}`,
                  )
                }
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-extrabold cursor-pointer text-red-600"
              >
                Review
              </button>
            </div>
          ))}
          {!pendingRegistrations.length && (
            <p className="px-4 py-8 text-center text-xs text-slate-500">
              No pending registrations
            </p>
          )}
        </article>
        <div className="space-y-4">
          <SummaryBox
            title="Support Tickets"
            rows={[
              ["Open", ticketStats.Open || 0, "red"],
              ["In Progress", ticketStats["In Progress"] || 0, "blue"],
              ["Resolved", ticketStats.Resolved || 0, "green"],
            ]}
            onClick={() => navigate("/admin/tickets")}
          />
          <SummaryBox
            title="Enquiries"
            rows={[
              ["Total Enquiries", enquiryStats.total || 0, "red"],
              ["Replied", enquiryStats.replied || 0, "blue"],
              ["Not Replied", enquiryStats.notReplied || 0, "green"],
            ]}
            onClick={() => navigate("/admin/enquiries")}
          />
        </div>
      </section>
      <div className="relative">
        <select
          value={growthRange}
          onChange={(event) => setGrowthRange(event.target.value)}
          className="absolute right-4 top-4 z-10 rounded-lg border border-slate-200 px-2 py-1 text-xs"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="6m">Last 6 Months</option>
        </select>
        <PlatformGrowth data={growth} />
      </div>
    </>
  );
};

function PlatformGrowth({ data }) {
  const max = Math.max(
    ...data.flatMap((item) => [
      item.users,
      item.bloodBanks,
      item.hospitals,
      item.deliveryPartners,
    ]),
    1,
  );
  const series = [
    ["Users", "#ef4444"],
    ["Blood Banks", "#3b82f6"],
    ["Hospitals", "#10b981"],
    ["Delivery Partners", "#f59e0b"],
  ];
  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <BarChart3 className="size-4 text-red-600" />
        <h2 className="text-sm font-extrabold">Platform Growth</h2>
      </div>
      <div className="mt-4 flex h-32 items-end justify-center gap-3 border-b border-slate-100">
        {data.length ? (
          [
            [data[0].users, series[0][1]],
            [data[0].bloodBanks, series[1][1]],
            [data[0].hospitals, series[2][1]],
            [data[0].deliveryPartners, series[3][1]],
          ].map(([value, color], index) => (
            <div
              key={index}
              className="flex h-full flex-col items-center mr-6 justify-end"
            >
              <span className="mb-1 text-[10px] font-bold text-slate-500">
                {value}
              </span>
              <span
                className="block w-8 rounded-t"
                style={{
                  height: `${Math.max((value / max) * 100, value ? 5 : 0)}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          ))
        ) : (
          <p className="mb-8 text-xs text-slate-400">
            No registrations in this period
          </p>
        )}
      </div>
      <div className="mt-3 flex justify-center gap-4 text-[11px] text-slate-600">
        {series.map(([label, color]) => (
          <span key={label} className="flex items-center gap-1">
            <i
              className="size-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}

function SummaryBox({ title, rows, onClick }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-slate-900">{title}</h2>
        <button
          onClick={onClick}
          className="text-xs font-extrabold text-red-600"
        >
          View All →
        </button>
      </div>
      {rows.map(([label, value, tone]) => (
        <div
          key={label}
          className="flex justify-between border-t border-slate-100 py-1.5 text-xs"
        >
          <span>{label}</span>
          <b
            className={`rounded-full px-3 py-1 ${tone === "red" ? "bg-red-50 text-red-600" : tone === "blue" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}
          >
            {value}
          </b>
        </div>
      ))}
    </article>
  );
}
