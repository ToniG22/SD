// Function to handle form submission
function handleFormSubmit(event: Event) {
    event.preventDefault();

    const localInput = document.getElementById('local') as HTMLInputElement;
    const dateInput = document.getElementById('date') as HTMLInputElement;
    const timeInput = document.getElementById('time') as HTMLInputElement;
    const participantsInput = document.getElementById('participants') as HTMLInputElement;
    const priceInput = document.getElementById('price') as HTMLInputElement;

    const local = localInput.value;
    const date = dateInput.value;
    const time = timeInput.value;
    const participants = parseInt(participantsInput.value, 10);
    const price = parseFloat(priceInput.value);

    // Log the form data
    console.log('Local:', local);
    console.log('Date:', date);
    console.log('Time:', time);
    console.log('Number of Participants:', participants);
    console.log('Price:', price);
}

// Add an event listener to the form's submit event
const eventForm = document.getElementById('event-form');
eventForm.addEventListener('submit', handleFormSubmit);
