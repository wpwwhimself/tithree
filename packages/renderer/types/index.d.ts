import { Moment } from "moment";

export interface SelectOption{
  key: string,
  value: string,
  price?: number,
}
export interface Setting{
  name: string,
  desc: string,
  value: string,
}
export interface Session{
  id: number,
  session_date: string,
  student_id: number,
  student_name?: string,
  duration: number,
  price: number,
  price_factor_below_1: number,
  session_count?: number,
  session_time?: number,
  session_value?: number,
  session_value_weekly?: number,
}
export interface Student{
  id: number,
  first_name: string,
  last_name: string,
  nickname?: string,
  student_name?: string,
  price: number,
  phone: string?,
  note: string?,
  suspended: 0 | 1 | 2,
}
export interface CalEvent{
  eventId?: string | null,
  date: string,
  title: string,
  student?: Student,
  startTime: Moment,
  duration: number,
}
export interface CalDay{
  date: Moment,
  events?: CalEvent[],
}

export interface ToastData{
  visible?: boolean,
  title: string,
  subtitle?: string,
  icon?: string,
  error: boolean,
}
