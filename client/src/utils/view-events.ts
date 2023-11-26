// Function to populate table

interface events {
  Date: string;
  EventTime: string;
  Id: string;
  Local: string;
  Participants: number;
  Price: number;
}
[];

function populateTable(): void {
  const tableBody: HTMLTableSectionElement | null =
    document.querySelector("tbody");

  fetch("http://localhost:3000/events", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      data.forEach((event: events) => {
        const row: HTMLTableRowElement = document.createElement("tr");
        row.innerHTML = `
                  <td data-id="${
                    event.Id
                  }"><span class="editable editable-local">${
          event.Local
        }</span><input type="text" class="edit-field edit-local" value="${
          event.Local
        }" style="display:none;"></td>
                  <td data-id="${
                    event.Id
                  }"><span class="editable editable-date">${
          event.Date
        }</span><input type="datetime-local" class="edit-field edit-date" value="${formatDateTime(
          event.Date
        )}" style="display:none;"></td>
                  <td data-id="${
                    event.Id
                  }"><span class="editable editable-participants">${
          event.Participants
        }</span><input type="text" class="edit-field edit-participants" value="${
          event.Participants
        }" style="display:none;"></td>
                  <td data-id="${
                    event.Id
                  }"><span class="editable editable-price">${
          event.Price
        }</span><input type="text" class="edit-field edit-price" value="${
          event.Price
        }" style="display:none;"></td>
                  <td>
                      <button class="edit-button">Edit</button>
                      <button class="save-button" style="display:none;">Save</button>
                      <button class="cancel-button" style="display:none;">Cancel</button>
                      <button class="delete-button" data-local="${
                        event.Local
                      }">Delete</button>
                  </td>
              `;

        // Attach event handlers for edit and delete buttons
        const editButton: HTMLButtonElement = row.querySelector(".edit-button");
        const saveButton: HTMLButtonElement = row.querySelector(".save-button");
        const cancelButton: HTMLButtonElement =
          row.querySelector(".cancel-button");
        const deleteButton: HTMLButtonElement =
          row.querySelector(".delete-button");
        const editableFields: NodeListOf<HTMLElement> =
          row.querySelectorAll(".editable");
        const editFields: NodeListOf<HTMLInputElement> =
          row.querySelectorAll(".edit-field");

        editButton.addEventListener("click", () =>
          handleEdit(
            editButton,
            saveButton,
            cancelButton,
            editableFields,
            editFields
          )
        );
        saveButton.addEventListener("click", () =>
          handleSave(
            editButton,
            saveButton,
            cancelButton,
            editableFields,
            editFields
          )
        );
        cancelButton.addEventListener("click", () =>
          handleCancel(
            editButton,
            saveButton,
            cancelButton,
            editableFields,
            editFields
          )
        );
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
function handleEdit(
  editButton: HTMLButtonElement,
  saveButton: HTMLButtonElement,
  cancelButton: HTMLButtonElement,
  editableFields: NodeListOf<HTMLElement>,
  editFields: NodeListOf<HTMLInputElement>
): void {
  editButton.style.display = "none";
  saveButton.style.display = "inline-block";
  cancelButton.style.display = "inline-block";

  // Make editable fields visible and input fields hidden
  editableFields.forEach((field) => (field.style.display = "none"));
  editFields.forEach((field) => (field.style.display = "inline-block"));
}

// Handle save button click
async function handleSave(
  editButton: HTMLButtonElement,
  saveButton: HTMLButtonElement,
  cancelButton: HTMLButtonElement,
  editableFields: NodeListOf<HTMLElement>,
  editFields: NodeListOf<HTMLInputElement>
): Promise<void> {
  // Hide the save and cancel buttons and show the edit button
  editButton.style.display = "inline-block";
  saveButton.style.display = "none";
  cancelButton.style.display = "none";
  const row: HTMLTableRowElement | null = editButton.closest("tr");
  if (row) {
    const eventId: string | null = row
      .querySelector("td[data-id]")
      ?.getAttribute("data-id");
    if (eventId) {
      const inputDate: string =
        (
          row.querySelector(
            "td[data-id] .edit-field.edit-date"
          ) as HTMLInputElement
        )?.value || "";

      // Parse the input date and format it
      const parsedDate = new Date(inputDate);
      const formattedDate = parsedDate.toISOString();
      const eventData = {
        Date: formattedDate,
        EventTime: "",
        Local:
          (
            row.querySelector(
              "td[data-id] .edit-field.edit-local"
            ) as HTMLInputElement
          )?.value || "",

        Participants:
          (
            row.querySelector(
              "td[data-id] .edit-field.edit-participants"
            ) as HTMLInputElement
          )?.value || "",
        Price:
          (
            row.querySelector(
              "td[data-id] .edit-field.edit-price"
            ) as HTMLInputElement
          )?.value || "",
      };
      console.log(eventData);
      try {
        // Make a PATCH request to update the event data
        const response = await fetch(
          `http://localhost:3000/events/${eventId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ eventData }),
          }
        );

        if (response.ok) {
          console.log("Event data updated successfully");
        } else {
          console.error("Failed to update event data");
        }
      } catch (error) {
        console.error("Error updating event data:", error);
      }
    }
  }

  // Update the values in editable fields with input field values
  editableFields.forEach((field, index) => {
    if (editFields[index].type === "datetime-local") {
      // Convert the datetime-local input value to a formatted date and time string
      const date: Date = new Date(editFields[index].value);
      const formattedDate: string = date.toLocaleDateString();
      const formattedTime: string = date.toLocaleTimeString();
      field.textContent = `${formattedDate} ${formattedTime}`;
    } else {
      field.textContent = editFields[index].value;
    }
  });

  editableFields.forEach((field) => (field.style.display = "inline-block"));
  editFields.forEach((field) => (field.style.display = "none"));
}

// Handle cancel button click
function handleCancel(
  editButton: HTMLButtonElement,
  saveButton: HTMLButtonElement,
  cancelButton: HTMLButtonElement,
  editableFields: NodeListOf<HTMLElement>,
  editFields: NodeListOf<HTMLInputElement>
): void {
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
async function handleDelete(event: MouseEvent): Promise<void> {
  const button: HTMLButtonElement = event.currentTarget as HTMLButtonElement;

  // Find the closest table row
  const row: HTMLTableRowElement | null = button.closest("tr");

  if (row) {
    // Get the event ID from the data-id attribute
    const eventId: string | null = row
      .querySelector("td[data-id]")
      ?.getAttribute("data-id");
    if (eventId) {
      await fetch(`http://localhost:3000/events/${eventId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            console.log(`Event with ID ${eventId} deleted successfully`);
          } else {
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

function formatDateTime(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  const formattedDate = date.toISOString().slice(0, 16); // "yyyy-MM-ddThh:mm"
  return formattedDate;
}

function parseFormattedDate(formattedDate: string): string {
  // formato que estava
  const dateParts = formattedDate.split("T");
  const date = new Date(dateParts[0] + "T" + dateParts[1] + ":00.000Z");
  return date.toISOString().slice(0, 19).replace("T", " "); // Original format: "yyyy-MM-dd hh:mm"
}

// Call the populateTable function when the page loads
window.addEventListener("DOMContentLoaded", populateTable);
