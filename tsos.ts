function updateDate(): void {
    // Get the 'date' div element by its ID
    const dateDiv: HTMLElement | null = document.getElementById("dateContainer");

    const currentDate: Date = new Date();

    // formatting options for the date and time
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',   
        year: 'numeric',  
        month: 'long',    
        day: 'numeric',    
        hour: 'numeric',   
        minute: 'numeric',
        second: 'numeric'  
    };

    // Format the current date and time as a string
    const formattedDate: string = currentDate.toLocaleDateString('en-US', options);

    // Update the content of the 'date' div with the formatted date and time
    if (dateDiv) {
        dateDiv.innerHTML = `<p>${formattedDate}</p>`;
    }
}

// const blade = document.querySelector('.blade');

// if (blade) {
//     document.querySelector('.switch-btn')?.addEventListener('click', function(){
//         blade.classList.toggle('blade-height');
//     });
// }


// display the date when the page loads
updateDate();

// (1000 milliseconds)
setInterval(updateDate, 1000); // Update every 1 second
