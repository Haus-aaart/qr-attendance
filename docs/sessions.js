// Configure sessions in local time (Europe/Berlin on most phones in Germany).
// dayOfWeek: 0=Sun ... 6=Sat
// start/end are minutes since midnight.

window.SESSIONS = [
  {
    id: "mon-1800",
    label: "Monday Training 18:00",
    dayOfWeek: 1,
    startMinutes: 18 * 60,
    endMinutes: 19 * 60 + 30,
    earlyCheckinMinutes: 20,
    lateCheckinMinutes: 20
  },
  {
    id: "wed-1900",
    label: "Wednesday Training 19:00",
    dayOfWeek: 3,
    startMinutes: 19 * 60,
    endMinutes: 20 * 60 + 30,
    earlyCheckinMinutes: 20,
    lateCheckinMinutes: 20
  },
  {
    id: "sat-1000",
    label: "Saturday Training 10:00",
    dayOfWeek: 6,
    startMinutes: 10 * 60,
    endMinutes: 11 * 60 + 30,
    earlyCheckinMinutes: 30,
    lateCheckinMinutes: 20
  }
];
