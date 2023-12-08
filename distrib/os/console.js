/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    class Console {
        currentFont;
        currentFontSize;
        currentXPosition;
        currentYPosition;
        buffer;
        constructor(currentFont = _DefaultFontFamily, currentFontSize = _DefaultFontSize, currentXPosition = 0, currentYPosition = _DefaultFontSize, buffer = "") {
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
        }
        commandHistory = [];
        // -1 = no command has been recalled yet
        commandHistoryIndex = -1;
        init() {
            this.clearScreen();
            this.resetXY();
        }
        clearScreen() {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }
        resetXY() {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }
        handleInput() {
            let charWidth = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer);
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // Add command to history
                    this.commandHistory.push(this.buffer);
                    // Reset the index
                    this.commandHistoryIndex = this.commandHistory.length;
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) {
                    //handles the backsapce command
                    this.buffer = this.buffer.slice(0, -1);
                    this.removeText();
                }
                else if (chr === String.fromCharCode(9)) {
                    //handles the tab command
                    let shellCommands = ['ver', 'help', 'shutdown', 'cls', 'man', 'trace', 'rot13', 'prompt', 'date', 'wherami', 'game', 'status', 'bsod', 'load', 'run', 'clearmem', 'runall', 'ps', 'kill', 'killall', 'quantum', 'format', 'create'];
                    this.tabCompletion(shellCommands);
                }
                else if (chr === String.fromCharCode(38)) {
                    //handles up arrow      
                    //This is basically a new way I am trying to implemenmt the .clearRect() 
                    //method bc shit just doesnt wanna be erased
                    //yes, me and chatGPT are doing this together. buddys the debugging god rn
                    if (this.commandHistoryIndex > 0) {
                        this.commandHistoryIndex--;
                        this.buffer = this.commandHistory[this.commandHistoryIndex];
                        const bufferStartX = 0;
                        const bufferStartY = this.currentYPosition - this.getLineHeight();
                        // Calculate the width to clear
                        const bufferWidth = charWidth * Math.max(...this.commandHistory.map(cmd => cmd.length)); // Max possible width
                        // Clear the entire buffer area
                        _DrawingContext.clearRect(bufferStartX, bufferStartY, bufferWidth, this.getLineHeight());
                        // Reset the cursor position to the start of the buffer
                        this.currentXPosition = bufferStartX;
                        // Now, put the buffer text back
                        this.putText(this.buffer);
                    }
                }
                else if (chr === String.fromCharCode(40)) {
                    //handles down arrow   
                    if (this.commandHistoryIndex < this.commandHistory.length - 1) {
                        this.commandHistoryIndex++;
                        this.buffer = this.commandHistory[this.commandHistoryIndex];
                        const bufferStartX = 0;
                        const bufferStartY = this.currentYPosition - this.getLineHeight();
                        // Calculate the width to clear
                        const bufferWidth = charWidth * Math.max(...this.commandHistory.map(cmd => cmd.length)); // Max possible width
                        // Clear the entire buffer area
                        _DrawingContext.clearRect(bufferStartX, bufferStartY, bufferWidth, this.getLineHeight() * 1.5); //gotta *1.5 for larger characters for some reason
                        //you would think the method would just work but figureing out the 
                        //length of a character, you would think
                        // Reset the cursor position to the start of the buffer
                        this.currentXPosition = bufferStartX;
                        this.putText(this.buffer);
                    }
                    else {
                        // If at the bottom of the history, clear the input
                        this.commandHistoryIndex = this.commandHistory.length;
                        this.buffer = "";
                        const bufferStartX = 0;
                        const bufferStartY = this.currentYPosition - this.getLineHeight();
                        // Calculate the width to clear
                        const bufferWidth = charWidth * Math.max(...this.commandHistory.map(cmd => cmd.length));
                        // Clear the entire buffer area
                        _DrawingContext.clearRect(bufferStartX, bufferStartY, bufferWidth, this.getLineHeight() * 1.5);
                    }
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }
        //creates the user's interative line
        putText(text) {
            // Split the text into individual characters instead of words
            // had to move away from orginal design due to spacebar not showing up on frontend side
            // chatGPT suggested the use of an Array system and helped with code debugging issues
            let characters = Array.from(text);
            let line = '';
            for (let char of characters) {
                //determine if the line will excedd canvas width
                let testLine = line + char;
                let testWidth = _DrawingContext.measureText(this.currentFont, this.currentFontSize, testLine);
                if (testWidth > _Canvas.width) {
                    // Draw the current line and reset for the next line
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, line);
                    this.advanceLine();
                    line = char;
                }
                else {
                    line += char;
                }
            }
            // Draw any remaining text
            if (line !== "") {
                // Calculate the width of the text string that's about to be printed
                var textWidth = _DrawingContext.measureText(this.currentFont, this.currentFontSize, line);
                // Check the width plus the current X position exceeds the canvas width
                if (this.currentXPosition + textWidth > _Canvas.width) {
                    // Reset the X position and increment the Y position to move to the next line
                    this.currentXPosition = 0;
                    this.currentYPosition += _DefaultFontSize + 5; //can adjust this but nothing under 5
                }
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, line);
                // Move the current X position.
                this.currentXPosition += textWidth;
            }
        }
        //insperation of function from jOSh due to my first charcter not deleting even though it was in 
        //the original advanceLine() function but gotta give credit
        //honestly getting really desperate to get that character deleted lol :(
        //its been a very long time trying to debug this
        //if I had a penny for the amount of times I edited the _DrawingContext.clearRect()...
        getLineHeight() {
            // Using Math.round so that the text is not blurred. If you are curious to see, just take away the Math.round
            return Math.round(_DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin);
        }
        advanceLine() {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            // Checks if the next two lines after the advance would still be within the canvas boundaries
            //if I did not add the 2 line check, then the advance of the canvas and line wrapping would mess up the console
            if (this.currentYPosition + (2 * this.getLineHeight()) > _Canvas.height) {
                // Create an offscreen canvas
                //inspiration for offscreenCanvas : https://stackoverflow.com/questions/6608996/is-it-possible-to-create-an-html-canvas-without-a-dom-element
                let offscreenCanvas = document.createElement('canvas');
                offscreenCanvas.width = _Canvas.width;
                offscreenCanvas.height = _Canvas.height;
                let offscreenCtx = offscreenCanvas.getContext('2d');
                //chatGPT suggested code
                // Copy the visible content of the main canvas onto the offscreen canvas
                offscreenCtx.drawImage(_Canvas, 0, 0);
                // Clear the main canvas
                _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
                // Draw the content from the offscreen canvas back onto the main canvas, but shifted upwards by two lines
                _DrawingContext.drawImage(offscreenCanvas, 0, -2 * this.getLineHeight());
                // Adjust the current Y position
                this.currentYPosition -= this.getLineHeight();
            }
            else {
                // If not exceeding, just advance the Y position as usual
                this.currentYPosition += this.getLineHeight();
            }
        }
        //will implement the use of backspacing
        removeText() {
            //This twas my origional code for this however
            //every time I backspaced the first character printed would not
            //be deleted visually but code wise would be still working
            //exmaple: enter 'hhhhh' and delete the h's and it will stay as
            //'h' but you can type 'help' and the help command will still work 
            //Need to check for the start character as well as the lastChar variable would not work for the first character
            // Get the width of the last character in the buffer.
            let lastChar = this.buffer.slice(-1);
            let lastCharWidth = _DrawingContext.measureText(this.currentFont, this.currentFontSize, lastChar);
            // Adjust the currentXPosition
            this.currentXPosition -= lastCharWidth;
            // If the cursor is at the start of a line, adjust the currentYPosition and set currentXPosition to the end of the previous line.
            if (this.currentXPosition < 0) {
                this.currentYPosition -= this.getLineHeight();
                this.currentXPosition = _Canvas.width;
            }
            // Clear the space previously occupied by the last character.
            _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - this.currentFontSize * 1.5, _Canvas.width, this.getLineHeight() * 1.5);
        }
        //_DrawingContext.clearRect(this.currentXPosition ,this.currentYPosition - this.currentFontSize * 1.5, _Canvas.width, this.getLineHeight());
        //used for tab completion from the shell commands
        tabCompletion(shellCommands) {
            // Filter shellCommands to get commands that start with the current buffer.
            let matchingCommands = shellCommands.filter(cmd => cmd.startsWith(this.buffer));
            // If only one command matches, update the buffer and display the command.
            //must do this due to commands starting with the same character
            if (matchingCommands.length === 1) {
                // Update the buffer with the matching command.
                this.buffer = matchingCommands[0];
                // Clear the current line on the console
                _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - this.currentFontSize, this.buffer, this.currentFontSize * 1.5); // Adjust the height if necessary.
                // Display the completed command on the console.
                this.putText(this.buffer);
            }
        }
        displayBSOD() {
            // Load the BSOD image
            let bsodImage = new Image();
            bsodImage.src = "./distrib/images/BSOD_Message.png";
            bsodImage.onload = function () {
                // Clear the console
                _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
                // Display the BSOD image
                _DrawingContext.drawImage(bsodImage, 0, 0, _Canvas.width, _Canvas.height);
            };
        }
    }
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map