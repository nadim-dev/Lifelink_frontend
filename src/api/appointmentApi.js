import { axiosWithCreds } from "./axiosInstances";

export const BookAppointment=(doctorId)=>
    axiosWithCreds.post("/api/appointments/book-appointment",{doctorId})

export const GetMyAppointments = () =>
    axiosWithCreds.get("/api/appointments/my-appointments");
