document.addEventListener("DOMContentLoaded", () => {
  const dataTypeSelect = document.getElementById("dataType");
  const pageInput = document.getElementById("page");
  const sizeInput = document.getElementById("size");
  const submitBtn = document.getElementById("submitBtn");
  const dataTable = document.getElementById("dataTable");
  const downloadCsvBtn = document.getElementById("downloadCsv");
  const downloadExcelBtn = document.getElementById("downloadExcel");
  const downloadButtonsDiv = document.querySelector(".download-buttons");

  let currentData = []; // To store the fetched data for download

  submitBtn.addEventListener("click", fetchData);
  downloadCsvBtn.addEventListener("click", downloadCsv);
  downloadExcelBtn.addEventListener("click", downloadExcel);

  async function fetchData() {
    const selectedPath = dataTypeSelect.value;
    const page = pageInput.value;
    const size = sizeInput.value;

    const apiKey = "apiKey"; //Gunakan API Key yang telah di generate dari APILOGY
    const url = `https://dataexchange-api.apilogy.id/catalog_data_exchange/1.0.4${selectedPath}?page=${page}&size=${size}`; // Endpoint API

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status} - ${
            errorData.message || response.statusText
          }`
        );
      }

      const result = await response.json();
      currentData = result.data; // Store the fetched data

      if (currentData && currentData.length > 0) {
        renderTable(currentData);
        downloadButtonsDiv.style.display = "block"; // Show download buttons
      } else {
        dataTable.innerHTML = "<tr><td>Tidak ada data yang tersedia.</td></tr>";
        downloadButtonsDiv.style.display = "none"; // Hide download buttons
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      dataTable.innerHTML = `<tr><td>Gagal mengambil data: ${error.message}. Pastikan kunci API Anda benar.</td></tr>`;
      downloadButtonsDiv.style.display = "none"; // Hide download buttons on error
    }
  }

  function renderTable(data) {
    if (!data || data.length === 0) {
      dataTable.innerHTML = "<tr><td>Tidak ada data yang tersedia.</td></tr>";
      return;
    }

    const headers = Object.keys(data[0]);
    let tableHTML = "<thead><tr>";
    headers.forEach((header) => {
      tableHTML += `<th>${header}</th>`;
    });
    tableHTML += "</tr></thead><tbody>";

    data.forEach((row) => {
      tableHTML += "<tr>";
      headers.forEach((header) => {
        tableHTML += `<td>${row[header]}</td>`;
      });
      tableHTML += "</tr>";
    });
    tableHTML += "</tbody>";
    dataTable.innerHTML = tableHTML;
  }

  function convertToCsv(data) {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(","));

    // Add data rows
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        // Handle commas and newlines in values
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  }

  function downloadCsv() {
    const csvContent = convertToCsv(currentData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadExcel() {
    if (!currentData || currentData.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(currentData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, "data.xlsx");
  }
});
