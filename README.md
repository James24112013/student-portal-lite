# Northstar Student Portal

## Student portal
Open `index.html` for the student dashboard.

## Separate Administrator Portal
Open `admin.html` for the teacher/admin timetable manager. It lets you:

- select a student
- add classes with day, time, subject, room, teacher, and colour
- remove individual classes
- clear a student's timetable

The student and admin pages share timetable data through browser `localStorage` under the `northstar-timetables` key. This is suitable for local demos on one browser. A real multi-device school system still needs authentication and a hosted database such as Supabase.

## Run locally

Open `index.html` and `admin.html` directly, or run:

```bash
python -m http.server 8000
```

Then visit:

- Student portal: http://localhost:8000/index.html
- Admin portal: http://localhost:8000/admin.html
