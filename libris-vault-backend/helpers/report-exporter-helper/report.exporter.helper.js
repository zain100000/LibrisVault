const ExcelJS = require("exceljs");
const { jsPDF } = require("jspdf");
require("jspdf-autotable");
const path = require("path");
const fs = require("fs");

/**
 * Export sales report to Excel
 * @param {Array} data - Report data array
 * @param {String} fileName - File name for export
 * @returns {String} - File path of generated Excel file
 */
exports.exportToExcel = async (data, fileName) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sales Report");

  worksheet.columns = [
    { header: "Seller ID", key: "sellerId", width: 30 },
    { header: "Seller Name", key: "sellerName", width: 25 },
    { header: "Seller Email", key: "sellerEmail", width: 35 },
    { header: "Period", key: "period", width: 15 },
    { header: "Total Sales", key: "totalSales", width: 15 },
    { header: "Total Orders", key: "totalOrders", width: 15 },
  ];

  data.forEach((item) => {
    worksheet.addRow(item);
  });

  const filePath = path.join(__dirname, `../exports/${fileName}`);
  await workbook.xlsx.writeFile(filePath);

  return filePath;
};

/**
 * Export sales report to PDF
 * @param {Array} data - Report data array
 * @param {String} fileName - File name for export
 * @returns {String} - File path of generated PDF file
 */
exports.exportToPDF = async (data, fileName) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Sales Report", 14, 15);

  const tableData = data.map((item) => [
    item.sellerId,
    item.sellerName,
    item.sellerEmail,
    item.period,
    item.totalSales,
    item.totalOrders,
  ]);

  doc.autoTable({
    head: [
      [
        "Seller ID",
        "Seller Name",
        "Seller Email",
        "Period",
        "Total Sales",
        "Total Orders",
      ],
    ],
    body: tableData,
    startY: 25,
  });

  const filePath = path.join(__dirname, `../salesReport/${fileName}`);
  doc.save(filePath);

  return filePath;
};

const exportsDir = path.join(__dirname, "../salesReport");
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir);
}
