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

document.addEventListener("DOMContentLoaded", function() {
    const blade = document.querySelector('.lightsaber .blade');
    const btnToggleSS = document.getElementById('btnToggleSS');

    if (!blade || !(blade instanceof HTMLElement)) {
        console.error('Could not find the blade element.');
        return;
    }

    if (!btnToggleSS) {
        console.error('Could not find the btnToggleSS element.');
        return;
    }
   
    document.getElementById('btnStartOS')?.addEventListener('click', function() {
        blade.classList.toggle('active');
    });

    btnToggleSS.addEventListener('click', function() {
        blade.classList.toggle('active'); // retract the blade

        setTimeout(function() {
            blade.classList.toggle('red'); // change the color
            blade.classList.toggle('active'); // extend the blade again
        }, 600); // set timeout for the transition duration of the blade retraction
    });
});



// display the date when the page loads
updateDate();

// (1000 milliseconds)
setInterval(updateDate, 1000); // Update every 1 second
