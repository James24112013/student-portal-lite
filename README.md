# Running Northstar locally

The project is a static website, so Python’s built-in web server is enough.

## Windows PowerShell or Command Prompt

1. Download and extract the repository.
2. Open a terminal inside the extracted `student-portal-lite` folder. In File Explorer, right-click the folder and choose **Open in Terminal**.
3. Run:

```bash
python -m http.server 8000
```

If `python` is not recognised, try:

```bash
py -m http.server 8000
```

## macOS or Linux

Open Terminal, move into the downloaded folder, and run:

```bash
cd ~/Downloads/student-portal-lite
python3 -m http.server 8000
```

Replace `~/Downloads/student-portal-lite` with the actual folder location. `cd path/to/student-portal-lite` is only a placeholder; do not type that exact text unless that is really the folder path.

## Open the pages

Once the server is running, open:

- Student portal: http://localhost:8000/index.html
- Separate Admin Portal: http://localhost:8000/admin.html

Keep the terminal open while using the site. Press **Ctrl+C** to stop the server.

The admin and student pages share timetable changes in the same browser through localStorage. Add a class in `admin.html`, then refresh `index.html` to see it.
