import * as XLSX from "xlsx";

export const exportToCSV = (data: Record<string, any>[]) => {
  if (!data || data.length === 0) return;

  const rawHeaders = Object.keys(data[0]);

  // Convert snake_case to readable headers
  const formattedHeaders = rawHeaders.map((key) =>
    key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );

  const escapeValue = (value: any) => {
    if (value === null || value === undefined) return "";
    return `"${String(value).replace(/"/g, '""')}"`;
  };

  const rows = [
    formattedHeaders.join(","), // ✅ Pretty headers
    ...data.map((row) =>
      rawHeaders.map((key) => escapeValue(row[key])).join(",")
    ),
  ];

  const csvString = rows.join("\r\n");

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const filename = `engineers_${yyyy}-${mm}-${dd}.csv`;

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 0);
};

export const exportToXLSX = (
  data: Record<string, any>[],
  fileName = "engineers"
) => {
  if (!data || data.length === 0) return;

  // 1. Format headers (snake_case → Title Case)
  const formatHeader = (key: string) =>
    key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const formattedData = data.map((row) => {
    const formattedRow: Record<string, any> = {};
    Object.entries(row).forEach(([key, value]) => {
      formattedRow[formatHeader(key)] = value ?? "";
    });
    return formattedRow;
  });

  // 2. Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // 3. Auto column width
  const columnWidths = Object.keys(formattedData[0]).map((key) => ({
    wch:
      Math.max(
        key.length,
        ...formattedData.map((row) => String(row[key] ?? "").length)
      ) + 2,
  }));

  worksheet["!cols"] = columnWidths;

  // 4. Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Engineers");

  // 5. Generate filename with date
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  XLSX.writeFile(workbook, `${fileName}_${yyyy}-${mm}-${dd}.xlsx`);
};
