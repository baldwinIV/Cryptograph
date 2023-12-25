alert('Hello World');

const result = {
  // ... (your data here)
};

// Get the table body element
const tableBody = document.getElementById('coinTableBody');

// Loop through the result object and add rows to the table
for (const code in result) {
  const coinInfo = result[code];

  // Create a new row
  const row = tableBody.insertRow();

  // Add cells to the row
  const cells = [
    coinInfo.symbol,
    coinInfo.name,
    coinInfo.name_kr,
    coinInfo.market_cap_kr,
    coinInfo.percent_change_24h,
    coinInfo.volume_24h
    // Add more cells as needed
  ];

  cells.forEach((cellText, index) => {
    const cell = row.insertCell(index);
    cell.textContent = cellText;
  });
}
