var form = document.getElementById("form");
form.onsubmit = function() {
  // Get the values from the form inputs
  var name = document.getElementById("nameInput").value;
  var url = document.getElementById("urlInput").value;

  // Get the table
  var table = document.getElementById("myTable");

  // Create a new row
  var row = table.insertRow();

  // Insert two cells into the new row
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);

  // Add the values from the form inputs to the cells
  cell1.innerHTML = name;
  cell2.innerHTML = url;

  // Clear the form inputs
  document.getElementById("nameInput").value = "";
  document.getElementById("urlInput").value = "";

  return false;
};
