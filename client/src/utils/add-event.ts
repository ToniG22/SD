// Function to handle form submission
function handleFormSubmit(event) {
    event.preventDefault();

    const nameInput = document.getElementById('name') as HTMLInputElement;
    const localInput = document.getElementById('local') as HTMLInputElement;
    const dateInput = document.getElementById('date') as HTMLInputElement;
    const timeInput = document.getElementById('time') as HTMLInputElement;
    const participantsInput = document.getElementById('participants') as HTMLInputElement;
    const priceInput = document.getElementById('price') as HTMLInputElement;

    const name = nameInput.value;
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
    
    // Create an object with the form data
    const eventData = {
        name: name,
        local: local,
        date: new Date(date),
        eventTime: time,
        participants: participants,
        price: price
    };

    // Make a POST request to the server
    fetch('http://10.2.15.143:30150/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)  // Convert the object to a JSON string
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        nameInput.value = '';
        localInput.value = '';
        dateInput.value = '';
        timeInput.value = '';
        participantsInput.value = '';
        priceInput.value = '';
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
