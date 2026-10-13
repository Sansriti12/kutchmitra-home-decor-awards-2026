import type { ReportApplicationItem, ReportJurorSummary } from "./report-actions";

/**
 * Escapes a single CSV field following RFC 4180 rules.
 */
function escapeCsvField(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates an RFC 4180-compliant CSV string with UTF-8 BOM for Microsoft Excel compatibility.
 */
export function generateApplicationsCsv(items: ReportApplicationItem[]): string {
  const headers = [
    "Nomination ID",
    "Category #",
    "Category Name",
    "Project Name",
    "Built-Up Area (sq. ft.)",
    "Completion Date",
    "Entrant Name",
    "Organization / Studio",
    "Entrant Email",
    "Project City",
    "Project State",
    "Kutch Focus",
    "Application Status",
    "Jury Status",
    "Shortlisted",
    "Shortlist Locked",
    "Winner Honor",
    "Publication Status",
    "Submitted At",
    "Created At",
  ];

  const rows = items.map((item) => [
    escapeCsvField(item.nominationId),
    escapeCsvField(item.categoryDisplayNumber),
    escapeCsvField(item.categoryName),
    escapeCsvField(item.projectName),
    escapeCsvField(item.builtUpAreaSqft ? String(item.builtUpAreaSqft) : ""),
    escapeCsvField(item.projectCompletionDate || ""),
    escapeCsvField(item.applicantName),
    escapeCsvField(item.organization || ""),
    escapeCsvField(item.applicantEmail),
    escapeCsvField(item.projectCity),
    escapeCsvField(item.projectState),
    escapeCsvField(item.isKutch ? "Yes (Kutch)" : "No"),
    escapeCsvField(item.status.toUpperCase()),
    escapeCsvField(item.juryStatus.toUpperCase()),
    escapeCsvField(item.isShortlisted ? "YES" : "NO"),
    escapeCsvField(item.isShortlistLocked ? "YES" : "NO"),
    escapeCsvField(item.awardTitle || (item.isWinner ? "Winner" : "")),
    escapeCsvField(item.winnerPublicationStatus ? item.winnerPublicationStatus.toUpperCase() : ""),
    escapeCsvField(item.submittedAt || "Unsubmitted"),
    escapeCsvField(item.createdAt),
  ]);

  const csvContent = [
    headers.map(escapeCsvField).join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\r\n");

  // UTF-8 BOM (\uFEFF) ensures Excel opens Unicode (e.g. Gujarati text) correctly
  return "\uFEFF" + csvContent;
}

/**
 * Generates an Excel-compatible XML Spreadsheet (SpreadsheetML) workbook.
 * Natively supported by Excel, Google Sheets, and LibreOffice with custom styling and named worksheet.
 */
export function generateApplicationsExcelXml(
  items: ReportApplicationItem[],
  worksheetName = "Applications Report"
): string {
  const sanitizeXml = (str: string | number | null | undefined): string => {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const headers = [
    "Nomination ID",
    "Category #",
    "Category Name",
    "Project Name",
    "Built-Up Area (sq ft)",
    "Entrant Name",
    "Organization / Studio",
    "Contact Email",
    "Project City",
    "Project State",
    "Kutch Focus",
    "Workflow Status",
    "Jury Status",
    "Shortlist Status",
    "Winner Honor",
    "Publication Status",
    "Submitted At",
    "Created Date",
  ];

  const headerCellsXml = headers
    .map(
      (h) => `
        <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${sanitizeXml(h)}</Data></Cell>`
    )
    .join("");

  const rowsXml = items
    .map((item) => {
      return `
      <Row>
        <Cell ss:StyleID="MonoBold"><Data ss:Type="String">${sanitizeXml(item.nominationId)}</Data></Cell>
        <Cell ss:StyleID="Centered"><Data ss:Type="String">${sanitizeXml(item.categoryDisplayNumber)}</Data></Cell>
        <Cell><Data ss:Type="String">${sanitizeXml(item.categoryName)}</Data></Cell>
        <Cell ss:StyleID="Bold"><Data ss:Type="String">${sanitizeXml(item.projectName)}</Data></Cell>
        <Cell ss:StyleID="Number"><Data ss:Type="${item.builtUpAreaSqft ? "Number" : "String"}">${item.builtUpAreaSqft ? item.builtUpAreaSqft : ""}</Data></Cell>
        <Cell><Data ss:Type="String">${sanitizeXml(item.applicantName)}</Data></Cell>
        <Cell><Data ss:Type="String">${sanitizeXml(item.organization || "")}</Data></Cell>
        <Cell><Data ss:Type="String">${sanitizeXml(item.applicantEmail)}</Data></Cell>
        <Cell><Data ss:Type="String">${sanitizeXml(item.projectCity)}</Data></Cell>
        <Cell><Data ss:Type="String">${sanitizeXml(item.projectState)}</Data></Cell>
        <Cell ss:StyleID="Centered"><Data ss:Type="String">${item.isKutch ? "Kutch Region" : "External"}</Data></Cell>
        <Cell ss:StyleID="Centered"><Data ss:Type="String">${sanitizeXml(item.status.toUpperCase())}</Data></Cell>
        <Cell ss:StyleID="Centered"><Data ss:Type="String">${sanitizeXml(item.juryStatus.toUpperCase())}</Data></Cell>
        <Cell ss:StyleID="Centered"><Data ss:Type="String">${item.isShortlisted ? "SHORTLISTED" : "-"}</Data></Cell>
        <Cell ss:StyleID="Centered"><Data ss:Type="String">${sanitizeXml(item.awardTitle || (item.isWinner ? "Winner" : "-"))}</Data></Cell>
        <Cell ss:StyleID="Centered"><Data ss:Type="String">${sanitizeXml(item.winnerPublicationStatus ? item.winnerPublicationStatus.toUpperCase() : "-")}</Data></Cell>
        <Cell><Data ss:Type="String">${sanitizeXml(item.submittedAt || "Draft / Unsubmitted")}</Data></Cell>
        <Cell><Data ss:Type="String">${sanitizeXml(item.createdAt.slice(0, 10))}</Data></Cell>
      </Row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>Kutchmitra Awards 2026 - Master Applications Report</Title>
  <Author>Kutchmitra Home &amp; Decor Awards 2026</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#C5A059"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#0A192F" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Bold">
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#0A192F"/>
  </Style>
  <Style ss:ID="MonoBold">
   <Font ss:FontName="Consolas" ss:Size="10" ss:Bold="1" ss:Color="#C5A059"/>
  </Style>
  <Style ss:ID="Centered">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Number">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${sanitizeXml(worksheetName)}">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="110"/>
   <Column ss:Width="50"/>
   <Column ss:Width="180"/>
   <Column ss:Width="190"/>
   <Column ss:Width="90"/>
   <Column ss:Width="130"/>
   <Column ss:Width="140"/>
   <Column ss:Width="160"/>
   <Column ss:Width="90"/>
   <Column ss:Width="80"/>
   <Column ss:Width="80"/>
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="110"/>
   <Column ss:Width="100"/>
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Row ss:Height="26">
    ${headerCellsXml}
   </Row>
   ${rowsXml}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitHorizontal>1</SplitHorizontal>
   <TopRowBottomPane>1</TopRowBottomPane>
   <ActivePane>2</ActivePane>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;
}

/**
 * Generates Jury Governance Report CSV.
 */
export function generateJuryReportCsv(jurors: ReportJurorSummary[]): string {
  const headers = [
    "Juror Name",
    "Email",
    "Organization",
    "Designation",
    "Total Assigned",
    "Evaluations Completed",
    "Pending Review",
    "Conflicts Declared",
    "Completion Rate (%)",
  ];

  const rows = jurors.map((j) => {
    const rate = j.totalAssigned > 0 ? Math.round((j.completed / j.totalAssigned) * 100) : 0;
    return [
      escapeCsvField(j.fullName),
      escapeCsvField(j.email),
      escapeCsvField(j.organization || ""),
      escapeCsvField(j.designation || ""),
      escapeCsvField(j.totalAssigned),
      escapeCsvField(j.completed),
      escapeCsvField(j.pending),
      escapeCsvField(j.conflicts),
      escapeCsvField(`${rate}%`),
    ];
  });

  const csv = [
    headers.map(escapeCsvField).join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\r\n");

  return "\uFEFF" + csv;
}

/**
 * Triggers browser file download with appropriate MIME type.
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
