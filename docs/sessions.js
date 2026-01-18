// Sessions in local time.
// dayOfWeek: 0=Sun ... 6=Sat
// startMinutes/endMinutes are minutes since midnight.
// Check-in policy requested:
// - Allowed from 15 minutes BEFORE session start
// - Until 15 minutes AFTER session start
// Implementation: earlyCheckinMinutes = 15; lateCheckinMinutes = 15
// Note: endMinutes is still included for labeling, but matching uses the window rule.

window.SESSIONS = [
  // Monday
  {
    id: "mon-1700",
    label: "Monday Training 17:00–19:00",
    dayOfWeek: 1,
    startMinutes: 17 * 60,
    endMinutes: 19 * 60,
    earlyCheckinMinutes: 15,
    lateCheckinMinutes: 15
  },
  {
    id: "mon-1900",
    label: "Monday Training 19:00–21:00",
    dayOfWeek: 1,
    startMinutes: 19 * 60,
    endMinutes: 21 * 60,
    earlyCheckinMinutes: 15,
    lateCheckinMinutes: 15
  },

  // Wednesday
  {
    id: "wed-1700",
    label: "Wednesday Training 17:00–19:00",
    dayOfWeek: 3,
    startMinutes: 17 * 60,
    endMinutes: 19 * 60,
    earlyCheckinMinutes: 15,
    lateCheckinMinutes: 15
  },
  {
    id: "wed-1900",
    label: "Wednesday Training 19:00–21:00",
    dayOfWeek: 3,
    startMinutes: 19 * 60,
    endMinutes: 21 * 60,
    earlyCheckinMinutes: 15,
    lateCheckinMinutes: 15
  },

  // Friday
  {
    id: "fri-1630",
    label: "Friday Training 16:30–18:30",
    dayOfWeek: 5,
    startMinutes: 16 * 60 + 30,
    endMinutes: 18 * 60 + 30,
    earlyCheckinMinutes: 15,
    lateCheckinMinutes: 15
  }
];
