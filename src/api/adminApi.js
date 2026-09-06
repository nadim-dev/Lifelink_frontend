import { axiosWithCreds } from "./axiosInstances";

export const getAdminDashboardStats = () =>
  axiosWithCreds.get("/api/admin/dashboard/stats");

export const getPendingRegistrations = () =>
  axiosWithCreds.get("/api/admin/pending-registrations");
export const getSupportTicketStats = () => axiosWithCreds.get("/api/support-tickets/admin/stats");
export const getEnquiryStats = () => axiosWithCreds.get("/api/enquiries/stats");
export const getPlatformGrowth = (range = "6m") => axiosWithCreds.get(`/api/admin/platform-growth?range=${range}`);
