// Function to handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    const localInput = document.getElementById('local');
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    const participantsInput = document.getElementById('participants');
    const priceInput = document.getElementById('price');
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
