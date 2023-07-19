export interface Setting{
  name: string,
  desc: string,
  value: string,
}

export interface Session{
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
