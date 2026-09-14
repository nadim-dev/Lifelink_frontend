import { axiosWithCreds, axiosWithoutCreds } from "./axiosInstances";
import { compressImage } from "../utils/compressImage";

export const registerHospitalApi = (data) =>
  axiosWithoutCreds.post("/api/hospitals/register", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getHospitalStats = () =>
  axiosWithCreds.get("/api/hospitals/stats");

export const getHospitals = () =>
  axiosWithCreds.get("/api/hospitals");

export const getHospitalById = (hospitalId) =>
  axiosWithCreds.get(`/api/hospitals/${hospitalId}`);
export const getMyHospitalProfile = () => axiosWithCreds.get("/api/hospitals/me/profile");
export const getMyHospitalDashboardSummary = () => axiosWithCreds.get("/api/hospitals/me/dashboard-summary");
export const updateMyHospitalProfile = (data) => axiosWithCreds.patch("/api/hospitals/me/profile/details", data);
export const updateMyEmergencyStatus = (emergencyStatus) => axiosWithCreds.patch("/api/hospitals/me/capacity/emergency-status", { emergencyStatus });
export const updateMyCapacityBed = (data) => axiosWithCreds.patch("/api/hospitals/me/capacity/bed", data);

export const getPublicHospitalById = (hospitalId) =>
  axiosWithCreds.get(`/api/hospitals/public/${hospitalId}`);
export const getPublicHospitalDoctors = (hospitalId) =>
  axiosWithCreds.get(`/api/hospitals/public/${hospitalId}/doctors`);
export const getPublicHospitalServicesFacilities = (hospitalId) =>
  axiosWithCreds.get(`/api/hospitals/public/${hospitalId}/services-facilities`);

export const updateHospitalStatus = (hospitalId, accountStatus) =>
  axiosWithCreds.patch(`/api/hospitals/${hospitalId}/status`, {
    accountStatus,
  });

export const getNearbyHospitals = (coordinates) =>
  axiosWithCreds.get("/api/hospitals/nearby");

export const createDoctor = async (data, profileImage) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, typeof value === "object" ? JSON.stringify(value) : value ?? "");
  });

  if (profileImage instanceof File) {
    formData.append("profileImage", await compressImage(profileImage), profileImage.name.replace(/\.[^.]+$/, ".jpg"));
  }

  return axiosWithCreds.post("/api/hospitals/doctors", formData);
};

export const getHospitalDoctors = () => axiosWithCreds.get("/api/hospitals/doctors");

export const updateDoctorStatus = (doctorId, status) =>
  axiosWithCreds.patch(`/api/hospitals/doctors/${doctorId}/status`, { status });
export const updateDoctorSchedule = (doctorId, availability) =>
  axiosWithCreds.patch(`/api/hospitals/doctors/${doctorId}/schedule`, { availability });
export const updateDoctor = async (doctorId, data, profileImage) => {
  const formData = new FormData();
  Object.entries({ ...data, qualifications: JSON.stringify(data.qualifications), availability: JSON.stringify(data.availability) }).forEach(([key, value]) => formData.append(key, value ?? ""));
  if (profileImage instanceof File) formData.append("profileImage", await compressImage(profileImage), profileImage.name.replace(/\.[^.]+$/, ".jpg"));
  return axiosWithCreds.patch(`/api/hospitals/doctors/${doctorId}`, formData);
};

export const createServiceFacility = async (data, image) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => formData.append(key, value ?? ""));
  if (image instanceof File) formData.append("image", await compressImage(image), image.name.replace(/\.[^.]+$/, ".jpg"));
  return axiosWithCreds.post("/api/hospitals/services-facilities", formData);
};
export const getHospitalServicesFacilities = () => axiosWithCreds.get("/api/hospitals/services-facilities");
export const deleteServiceFacility = (id) => axiosWithCreds.delete(`/api/hospitals/services-facilities/${id}`);
export const updateServiceFacility = (id, data) => axiosWithCreds.patch(`/api/hospitals/services-facilities/${id}`, data);
