// Function to populate table
[];
function populateTable() {
    const tableBody = document.querySelector("tbody");
    fetch("http://10.2.15.143:30150/events", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
        data.forEach((event) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                  <td data-id="${event.Id}"><span class="editable editable-local">${event.Local}</span><input type="text" class="edit-field edit-local" value="${event.Local}" style="display:none;"></td>
                  <td data-id="${event.Id}"><span class="editable editable-date">${formatDateTime(event.Date)}</span><input type="datetime-local" class="edit-field edit-date" value="${formatDateTime(event.Date)}" style="display:none;"></td>
                  <td data-id="${event.Id}"><span class="editable editable-participants">${event.Participants}</span><input type="text" class="edit-field edit-participants" value="${event.Participants}" style="display:none;"></td>
                  <td data-id="${event.Id}"><span class="editable editable-price">${event.Price}</span><input type="text" class="edit-field edit-price" value="${event.Price}" style="display:none;"></td>
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
    editButton.style.display = "none";
    saveButton.style.display = "inline-block";
    cancelButton.style.display = "inline-block";
    // Make editable fields visible and input fields hidden
    editableFields.forEach((field) => (field.style.display = "none"));
    editFields.forEach((field) => (field.style.display = "inline-block"));
}
// Handle save button click
async function handleSave(editButton, saveButton, cancelButton, editableFields, editFields) {
    // Hide the save and cancel buttons and show the edit button
    editButton.style.display = "inline-block";
    saveButton.style.display = "none";
    cancelButton.style.display = "none";
    const row = editButton.closest("tr");
    if (row) {
        const eventId = row
            .querySelector("td[data-id]")
            ?.getAttribute("data-id");
        if (eventId) {
            const inputDate = row.querySelector("td[data-id] .edit-field.edit-date")?.value || "";
            // Parse the input date and format it
            const parsedDate = new Date(inputDate);
            const formattedDate = parsedDate.toISOString();
            const eventData = {
                date: new Date(formattedDate),
                eventTime: "",
                local: row.querySelector("td[data-id] .edit-field.edit-local")?.value || "",
                participants: parseInt(row.querySelector("td[data-id] .edit-field.edit-participants")?.value) || 0,
                price: parseFloat(row.querySelector("td[data-id] .edit-field.edit-price")?.value) || 0,
            };
            console.log(eventData);
            try {
                // Make a PATCH request to update the event data
                const response = await fetch(`http://10.2.15.143:30150/events/${eventId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(eventData),
                });
                if (response.ok) {
                    console.log("Event data updated successfully");
                }
                else {
                    console.error("Failed to update event data");
                }
            }
            catch (error) {
                console.error("Error updating event data:", error);
            }
        }
    }
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
// Handle delete button click
async function handleDelete(event) {
    const button = event.currentTarget;
    // Find the closest table row
    const row = button.closest("tr");
    if (row) {
        // Get the event ID from the data-id attribute
        const eventId = row
            .querySelector("td[data-id]")
            ?.getAttribute("data-id");
        if (eventId) {
            await fetch(`http://10.2.15.143:30150/events/${eventId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                if (response.ok) {
                    console.log(`Event with ID ${eventId} deleted successfully`);
                }
                else {
                    console.error(`Failed to delete event with ID ${eventId}`);
                }
            })
                .catch((error) => {
                console.error("Error deleting event:", error);
            });
        }
        // Remove the table row from the DOM
        row.remove();
    }
}
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const formattedDate = date.toISOString().slice(0, 16); // "yyyy-MM-ddThh:mm"
    return formattedDate;
}
function parseFormattedDate(formattedDate) {
    // formato que estava
    const dateParts = formattedDate.split("T");
    const date = new Date(dateParts[0] + "T" + dateParts[1] + ":00.000Z");
    return date.toISOString().slice(0, 19).replace("T", " "); // Original format: "yyyy-MM-dd hh:mm"
}
// Call the populateTable function when the page loads
window.addEventListener("DOMContentLoaded", populateTable);
