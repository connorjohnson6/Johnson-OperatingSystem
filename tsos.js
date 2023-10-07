function updateDate() {
    // Get the 'date' div element by its ID
    var dateDiv = document.getElementById("dateContainer");
    var currentDate = new Date();
    // formatting options for the date and time
    var options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    };
    // Format the current date and time as a string
    var formattedDate = currentDate.toLocaleDateString('en-US', options);
    // Update the content of the 'date' div with the formatted date and time
    if (dateDiv) {
        dateDiv.innerHTML = "<p>".concat(formattedDate, "</p>");
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
