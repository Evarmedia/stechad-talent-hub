export const birthdayMonthDay = (value?: string | null) => value ? value.slice(-5) : "";

export const formatBirthday = (value?: string | null) => {
  const monthDay = birthdayMonthDay(value);
  if (!/^\d{2}-\d{2}$/.test(monthDay)) return "—";
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", timeZone: "UTC" })
    .format(new Date(`2000-${monthDay}T00:00:00Z`));
};
