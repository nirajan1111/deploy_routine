CREATE TABLE room (
  id INTEGER PRIMARY KEY,
  room_code VARCHAR(10),
  block_no VARCHAR(10),
  department VARCHAR(20),
  floor_no INT4,
  screen_available BOOL
);

CREATE TABLE teacher (
  name VARCHAR(100),
  email VARCHAR(100) PRIMARY KEY,
  department VARCHAR(20),
  designation VARCHAR(20)
);

CREATE TABLE student_section (
  id INTEGER PRIMARY KEY,
  name VARCHAR(50),
  program VARCHAR(10),
  year_enrolled INT4,
  group_name VARCHAR(2),
  department VARCHAR(20)
);

CREATE TABLE subject (
  id INT8 PRIMARY KEY,
  subject_code VARCHAR(10),
  name VARCHAR(100),
  department VARCHAR(20)
);

CREATE TABLE subject_teachers (
  subject_id INT8,
  teacher_email VARCHAR(100),
  PRIMARY KEY (subject_id, teacher_email),
  FOREIGN KEY (subject_id) REFERENCES subject(id),
  FOREIGN KEY (teacher_email) REFERENCES teacher(email)
);

CREATE TABLE schedules (
  id INT8 PRIMARY KEY,
  group_id INT8,
  room_id INT8,
  subject_id INT8,
  teacher_email VARCHAR(100),
  time_slot VARCHAR(20),
  FOREIGN KEY (group_id) REFERENCES student_section(id),
  FOREIGN KEY (room_id) REFERENCES room(id),
  FOREIGN KEY (subject_id) REFERENCES subject(id),
  FOREIGN KEY (teacher_email) REFERENCES teacher(email)
);

CREATE TABLE student (
  id INT8 PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  group_id INT8,
  FOREIGN KEY (group_id) REFERENCES student_section(id)
);

CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');

CREATE TABLE "user" (
  email VARCHAR(100) PRIMARY KEY,
  password VARCHAR(100) NOT NULL,
  role user_role NOT NULL,
  provider VARCHAR(20),  
  oauth_id VARCHAR(255), 
  profile_picture TEXT,  
  teacher_email VARCHAR(100),
  student_id INT8,
  FOREIGN KEY (teacher_email) REFERENCES teacher(email),
  FOREIGN KEY (student_id) REFERENCES student(id)
);

CREATE TABLE oauth_tokens (
  email VARCHAR(100) PRIMARY KEY REFERENCES "user"(email),
  refresh_token TEXT NOT NULL
);



-- Indexing for faster query performance
CREATE INDEX idx_schedules_group_id ON schedules(group_id);
CREATE INDEX idx_schedules_teacher_email ON schedules(teacher_email);
CREATE INDEX idx_schedules_room_id ON schedules(room_id);