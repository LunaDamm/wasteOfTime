import { computed } from "vue";

export function useTotalTime(entries) {
  // entries is the reactive array from useEntries
  const totalDurationMinutes = computed(() =>
    entries.value.reduce((sum, entry) => sum + (entry.durationMinutes || 0), 0)
  );

  const totalHours = computed(() => totalDurationMinutes.value / 60);

  function formatDuration(totalMinutes) {
    let minutes = totalMinutes;

    const minutesInHour = 60;
    const minutesInDay = 24 * minutesInHour;
    const minutesInWeek = 7 * minutesInDay;
    const minutesInMonth = 30 * minutesInDay; // Approximation
    const minutesInYear = 365 * minutesInDay; // Approximation

    const years = Math.floor(minutes / minutesInYear);
    minutes %= minutesInYear;

    const months = Math.floor(minutes / minutesInMonth);
    minutes %= minutesInMonth;

    const weeks = Math.floor(minutes / minutesInWeek);
    minutes %= minutesInWeek;

    const days = Math.floor(minutes / minutesInDay);
    minutes %= minutesInDay;

    const hours = Math.floor(minutes / minutesInHour);
    minutes %= minutesInHour;

    return { years, months, weeks, days, hours, minutes };
  }

  const totalTime = computed(() => {
    const { years, months, weeks, days, hours, minutes } = formatDuration(totalDurationMinutes.value);
    let parts = [];
    if (years) parts.push(`${years} year${years > 1 ? "s" : ""}`);
    if (months) parts.push(`${months} month${months > 1 ? "s" : ""}`);
    if (weeks) parts.push(`${weeks} week${weeks > 1 ? "s" : ""}`);
    if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
    if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (minutes || parts.length === 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
    return parts.join(", ");
  });

  return { totalTime, totalDurationMinutes, totalHours };
}
