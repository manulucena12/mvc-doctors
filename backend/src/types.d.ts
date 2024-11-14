import { Response, Request, NextFunction } from "express-serve-static-core";

declare global {
  namespace Express {
    interface Request {
      doctorId?: number;
      userId?: number;
    }
  }
}

export interface User {
  id?: number;
  name: string;
  password: string;
  email: string;
  doctor?: boolean;
  role?: "admin" | "user";
}

export interface Token {
  id: number;
  token: string;
  name: string;
  doctor: boolean;
}

export interface Appointment {
  id: number;
  doctor: number;
  patient: number;
  date: string;
  reason: string;
}

export type CompleteAppointment = Appointment & { email: string };

export interface Report {
  id: number;
  patient: number;
  doctor: number;
  date: string;
  pdf: Buffer;
}

export interface JwtPalyoad {
  id: number;
  role: string;
  doctor: boolean;
}

export interface Utils {
  getHours(beggin: string, end: string): [number, string, number, string];
  notifyUser(
    appointmentId: string,
    doctorId,
    reason: string,
    cancel: boolean,
  ): Promise<void>;
  getUserById(id: number): Promise<User | null>;
  bmiCalculator(cm: number, weight: number): string;
}

interface NutritionFact {
  carbohydrates: number;
  fiber: number;
  protein: number;
  fat: number;
  sugars: number;
  vitamins: string[];
  minerals: Array;
}

export interface Food {
  id: number;
  name: string;
  calories: number;
  nutritionFacts: NutritionFact;
}

export interface Message {
  sender: number;
  content: string;
  id: number;
  chat: number;
  date: string;
}

export interface Chat {
  id: number;
  patient: number;
  doctor: number;
  messages: Message[];
}

export interface Proof {
  id: number;
  patient: number;
  doctor: number;
  aproved?: boolean;
  file?: Buffer;
}

export interface AuthController {
  signup(
    req: Request<NonNullable<unknown>, NonNullable<unknown>, User>,
    res: Response,
  ): Promise<Response>;
  signin(
    req: Request<NonNullable<unknown>, NonNullable<unknown>, User>,
    res: Response,
  ): Promise<Response>;
  signout(
    req: Request<{ id: string }, NonNullable<unknown>, User>,
    res: Response,
  ): Promise<Response>;
}

export interface AuthModel {
  createUser(user: User): Promise<User | string>;
  createDoctor(user: User): Promise<User | string>;
  emailLogin(email: string, password: string): Promise<Token | string>;
  nameLogin(name: string, password: string): Promise<Token | string>;
  deleteUser(id: string): Promise<null | string>;
  checkNames(name: string): Promise<boolean>;
}

export interface AuthMiddleware {
  verifyToken(req: Request, res: Response, next: NextFunction): Promise;
  verifyAdmin(req: Request, res: Response, next: NextFunction): Promise;
  verifyDoctor(req: Request, res: Response, next: NextFunction): Promise;
}

export interface AppointmentController {
  createSchedule(req: Request, res: Response): Promise<Response>;
  getAppointments(req: Request, res: Response): Promise<Response>;
  getSingleAppointment(req: Request, res: Response): Promise<Response>;
  putPatient(req: Request, res: Response): Promise<Response>;
  cancelAppointment(req: Request, res: Response): Promise<Response>;
  createAppointment(req: Request, res: Response): Promise<Response>;
}

export interface AppointmentModel {
  createSameTime(
    x: number,
    y: number,
    time: string,
    day: string,
    id: number,
  ): Promise<Appointment[] | string>;
  createDifferentTime(
    x: number,
    y: number,
    day: string,
    id: number,
  ): Promise<Appointment[] | string>;
  getAppointments(
    day: string,
    doctorId: number,
  ): Promise<Appointment[] | string>;
  getAppointment(
    appointmentId: string,
    doctorId: number,
  ): Promise<Appointment | string>;
  getCompletedAppointment(
    appointmentId: string,
    doctorId: number,
  ): Promise<CompleteAppointment | string>;
  setAppointment(
    appointmentId: string,
    doctorId: number,
    patientId: number,
    reason: string,
  ): Promise<Appointment | string>;
  deleteAppointment(
    appointmentId: string,
    doctorId: number,
  ): Promise<null | string>;
  newAppointment(
    reason: string,
    doctorId: number,
    patientId: number,
    date: string,
  ): Promise<Appointment | string>;
}

export interface ReportsController {
  getReport(req: Request, res: Response): Promise<Response>;
  nutritonReport(req: Request, res: Response): Promise<Response>;
  getUserReports(req: Request, res: Response): Promise<Response>;
  deleteReport(req: Request, res: Response): Promise<Response>;
}

export interface ReportsModel {
  saveReport(
    patientId: number,
    doctorId: number,
    doc: Buffer,
  ): Promise<Report | string>;
  findReport(id: number): Promise<string | Report>;
  getDoctorReports(id: number): Promise<Report[] | string>;
  getPatientReports(id: number): Promise<Report[] | string>;
  deleteReport(id: number, doctorId: number): Promise<null | string>;
}

export interface ReportsUtils {
  createNutrition(
    patientName: string,
    doctorName: string,
    weight: number,
    height: number,
    fat: number,
    recommendations: string,
    patientId: number,
    doctorId: number,
    patology: string,
    bmr: number,
    ch: number,
    lipids: number,
    protein: number,
    goal: string,
  ): Promise<Report>;
  updateProof(
    proofId: number,
    doctorId: number,
    reason: string,
    date: string,
  ): Promise<Proof | null | string>;
  createProof(
    patientId: number,
    doctorId: number,
    reason: string,
    date: string,
  ): Promise<Proof | string>;
}

export interface ChatsController {
  createChat(req: Request, res: Response): Promise<Response>;
  getChat(req: Request, res: Response): Promise<Response>;
  createMessage(req: Request, res: Response): Promise<Response>;
}

export interface ChatsModel {
  newChat(patientId: number, doctorId: number): Promise<Chat | string>;
  getChat(chatId: number, userId: number): Promise<Chat | string>;
  newMessage(
    senderId: number,
    chatId: number,
    content: string,
  ): Promise<Message | string>;
}

export interface ProofController {
  requestProof(req: Request, res: Response): Promise<Response>;
  manageRequest(req: Request, res: Response): Promise<Response>;
  getProof(req: Request, res: Response): Promise<Response>;
  createProof(req: Request, res: Response): Promise<Response>;
}

export interface ProofModel {
  newRequest(userId: number, doctorId: number): Promise<Proof | string>;
  manageRequest(
    requestId: number,
    doctorId: number,
    aproved: boolean,
    file: Buffer | string,
  ): Promise<null | string | Proof>;
  getProof(proofId: number, userId: number): Promise<Proof | string>;
  newProof(
    patientId: number,
    doctorId: number,
    file: Buffer,
  ): Promise<Proof | string>;
}
