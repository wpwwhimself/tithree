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
  session_count?: number,
  session_time?: number,
  session_value?: number,
}
export interface Student{
  id: number,
  first_name: string,
  last_name: string,
  student_name?: string,
  price: number,
}
