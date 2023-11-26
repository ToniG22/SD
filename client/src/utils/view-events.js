// Function to populate table
[];
function populateTable() {
    const tableBody = document.querySelector("tbody");
    fetch("http://localhost:3000/events", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
        console.log("Success:", data);
        data.forEach((event) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                  <td><span class="editable">${event.Local}</span><input type="text" class="edit-field" value="${event.Local}" style="display:none;"></td>
                  <td><span class="editable">${event.Date}</span><input type="datetime-local" class="edit-field" value="${event.Date}" style="display:none;"></td>
                  <td><span class="editable">${event.Participants}</span><input type="text" class="edit-field" value="${event.Participants}" style="display:none;"></td>
                  <td><span class="editable">${event.Price}</span><input type="text" class="edit-field" value="${event.Price}" style="display:none;"></td>
                  <td>
                      <button class="edit-button">Edit</button>
                      <button class="save-button" style="display:none;">Save</button>
                      <button class="cancel-button" style="display:none;">Cancel</button>
                      <button class="delete-button" data-local="${event.Local}">Delete</button>
                  </td>
              `;
            // Attach event handlers for edit and delete buttons
            const editButton = row.querySelector(".edit-button");
            const saveButton = row.querySelector(".save-button");
            const cancelButton = row.querySelector(".cancel-button");
            const deleteButton = row.querySelector(".delete-button");
            const editableFields = row.querySelectorAll(".editable");
            const editFields = row.querySelectorAll(".edit-field");
            editButton.addEventListener("click", () => handleEdit(editButton, saveButton, cancelButton, editableFields, editFields));
            saveButton.addEventListener("click", () => handleSave(editButton, saveButton, cancelButton, editableFields, editFields));
            cancelButton.addEventListener("click", () => handleCancel(editButton, saveButton, cancelButton, editableFields, editFields));
            deleteButton.addEventListener("click", handleDelete);
            if (tableBody) {
                tableBody.appendChild(row);
            }
        });
    })
        .catch((error) => {
        console.error("Error:", error);
        // Handle error, e.g., display an error message to the user
    });
}
// Handle edit button click
function handleEdit(editButton, saveButton, cancelButton, editableFields, editFields) {
    // Hide the edit button and show save and cancel buttons
    editButton.style.display = "none";
    saveButton.style.display = "inline-block";
    cancelButton.style.display = "inline-block";
    // Make editable fields visible and input fields hidden
    editableFields.forEach((field) => (field.style.display = "none"));
    editFields.forEach((field) => (field.style.display = "inline-block"));
}
// Handle save button click
function handleSave(editButton, saveButton, cancelButton, editableFields, editFields) {
    // Hide the save and cancel buttons and show the edit button
    editButton.style.display = "inline-block";
    saveButton.style.display = "none";
    cancelButton.style.display = "none";
    // Update the values in editable fields with input field values
    editableFields.forEach((field, index) => {
        if (editFields[index].type === "datetime-local") {
            // Convert the datetime-local input value to a formatted date and time string
            const date = new Date(editFields[index].value);
            const formattedDate = date.toLocaleDateString();
            const formattedTime = date.toLocaleTimeString();
            field.textContent = `${formattedDate} ${formattedTime}`;
        }
        else {
            field.textContent = editFields[index].value;
        }
    });
    // Make editable fields visible and input fields hidden
    editableFields.forEach((field) => (field.style.display = "inline-block"));
    editFields.forEach((field) => (field.style.display = "none"));
}
// Handle cancel button click
function handleCancel(editButton, saveButton, cancelButton, editableFields, editFields) {
    // Hide the save and cancel buttons and show the edit button
    editButton.style.display = "inline-block";
    saveButton.style.display = "none";
    cancelButton.style.display = "none";
    // Restore the original values in editable fields
    editableFields.forEach((field, index) => {
        editFields[index].value = field.textContent || "";
    });
    // Make editable fields visible and input fields hidden
    editableFields.forEach((field) => (field.style.display = "inline-block"));
    editFields.forEach((field) => (field.style.display = "none"));
}
// Handle delete button click
function handleDelete(event) {
    const button = event.currentTarget;
    const local = button.getAttribute("data-local");
    // Implement your delete logic here
    if (local) {
        console.log(`Delete clicked for event with local: ${local}`);
    }
    // Remove the table row from the DOM
    const row = button.closest("tr");
    if (row) {
        row.remove();
    }
}
// Call the populateTable function when the page loads
window.addEventListener("DOMContentLoaded", populateTable);
