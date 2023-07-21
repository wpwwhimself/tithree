library(tidyverse)
source("_migration_from_xlsx/0_paths.r")

##############################

students <- readxl::read_xlsx(
  paste(path, "grafik_korkow.xlsx", sep = "/"),
  "osoby",
  "A2:B50"
)
colnames(students) <- c("name", "price")

students_out <- students %>%
  na.omit() %>%
  separate(name, c("first_name", "last_name"), " ") %>%
  mutate(across(where(is.character), ~na_if(., "???"))) %>%
  mutate(id = 1:nrow(.)) %>%
  select(id, first_name, last_name, price)

##############################

sessions <- readxl::read_xlsx(
  paste(path, "grafik_korkow.xlsx", sep = "/"),
  "godziny",
  "B1:AG366"
)
colnames(sessions) <- c(
  "session_date",
  paste("st", 1:(length(colnames(sessions)) - 1), sep = "")
)

sessions_out <- sessions %>%
  as.tibble() %>%
  mutate(session_date = seq(
    as.Date("2023-01-01"),
    as.Date("2023-12-31"),
    by = 1)
  ) %>%
  pivot_longer(
    -session_date,
    names_to = "student_id",
    values_to = "duration"
  ) %>%
  na.omit() %>%
  mutate(student_id = as.numeric(substr(student_id, 3, length(student_id)))) %>%
  left_join(students_out, c("student_id" = "id")) %>%
  select(student_id, session_date, duration, price)

write.csv(
  students_out,
  paste(path, "students.csv", sep = "/"),
  row.names = FALSE
)
write.csv(
  sessions_out,
  paste(path, "sessions.csv", sep = "/"),
  row.names = FALSE
)
