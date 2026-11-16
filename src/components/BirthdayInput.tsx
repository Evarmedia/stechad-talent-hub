import { useId } from "react";
import { birthdayMonthDay } from "@/lib/birthday";

const months = Array.from({ length: 12 }, (_, month) => new Intl.DateTimeFormat("en", { month: "long" }).format(new Date(2000, month, 1)));

type Props = { value: string; onChange: (value: string) => void; disabled?: boolean; required?: boolean };

export default function BirthdayInput({ value, onChange, disabled, required }: Props) {
  const id = useId();
  const [month = "", day = ""] = birthdayMonthDay(value).split("-");
  const days = month ? new Date(2000, Number(month), 0).getDate() : 31;
  return <fieldset disabled={disabled} className="space-y-2">
    <legend className="text-sm font-medium">Birthday (month and day){required ? " *" : ""}</legend>
    <div className="grid grid-cols-2 gap-3">
      <select aria-label="Birth month" id={`${id}-month`} required={required || Boolean(day)} value={month} onChange={event => {
        const next = event.target.value;
        const max = next ? new Date(2000, Number(next), 0).getDate() : 31;
        onChange(next || day ? `${next}-${Number(day) > max ? "" : day}` : "");
      }} className="h-10 rounded-md border bg-background px-3 text-sm">
        <option value="">Month</option>{months.map((label, index) => <option key={label} value={String(index + 1).padStart(2, "0")}>{label}</option>)}
      </select>
      <select aria-label="Birth day" id={`${id}-day`} required={required || Boolean(month)} value={day} onChange={event => onChange(month || event.target.value ? `${month}-${event.target.value}` : "")} className="h-10 rounded-md border bg-background px-3 text-sm">
        <option value="">Day</option>{Array.from({ length: days }, (_, index) => <option key={index} value={String(index + 1).padStart(2, "0")}>{index + 1}</option>)}
      </select>
    </div>
  </fieldset>;
}
