import { axiosWithCreds } from "./axiosInstances";

export const BookAppointment=(doctorId)=>
    axiosWithCreds.post("/api/appointments/book-appointment",{doctorId})

export const GetMyAppointments = () =>
    axiosWithCreds.get("/api/appointments/my-appointments");

export const GetMyAppointmentHistory = () =>
    axiosWithCreds.get("/api/appointments/my-appointment-history");

export const GetHospitalAppointments = (range = "today") =>
    axiosWithCreds.get(`/api/appointments/hospital-appointments?range=${range}`);

export const UpdateHospitalAppointmentStatus = (appointmentId, status) =>
    axiosWithCreds.patch(`/api/appointments/hospital-appointments/${appointmentId}/status`, { status });
