
export const exportToCSV = (data: any[]) => {
  if (!data.length) return;

  // Prepare CSV rows
  const headerRow = ["Name", "Country", "Experience (yrs)", "Status", "Email", "Phone", "Onboarded At"];
  const rows = data.map(eng => [
    eng.name,
    eng.country,
    eng.exp,
    eng.status,
    eng.email,
    eng.phone,
    eng.onboardedAt ? new Date(eng.onboardedAt).toLocaleDateString() : ""
  ]);
  const csvString = [headerRow, ...rows]
    .map(row =>
      row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")
    )
    .join("\r\n");

  // Dynamically generate the filename with the current date (YYYY-MM-DD)
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const filename = `engineers_${yyyy}-${mm}-${dd}.csv`;

  // Download
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
};
