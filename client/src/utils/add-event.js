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
    console.log(new Date(date));
    // Create an object with the form data
    const eventData = {
        local: local,
        date: new Date(date),
        eventTime: time,
        participants: participants,
        price: price
    };
    // Make a POST request to the server
    fetch('http://localhost:3000/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData) // Convert the object to a JSON string
    })
        .then(response => response.json())
        .then(data => {
        console.log('Success:', data);
        // Handle success, e.g., update UI or navigate to another page
    })
        .catch(error => {
        console.error('Error:', error);
        // Handle error, e.g., display an error message to the user
    });
}
// Add an event listener to the form's submit event
const eventForm = document.getElementById('event-form');
eventForm.addEventListener('submit', handleFormSubmit);
