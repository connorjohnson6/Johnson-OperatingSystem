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
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) {
                    //handles the backsapce command
                }
                else if (chr === String.fromCharCode(38)) {
                    //handles up arrow
                }
                else if (chr === String.fromCharCode(40)) {
                    //handles down arrow   
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
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                // Calculate the width of the text string that's about to be printed
                var textWidth = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                // Check if adding this width to the current X position exceeds the canvas width
                if (this.currentXPosition + textWidth > _Canvas.width) {
                    // Reset the X position and increment the Y position to move to the next line
                    this.currentXPosition = 0;
                    this.currentYPosition += _DefaultFontSize + 5; //could change this to anything higher,
                }
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        }
        //will implement the use of backspacing
        removeText(text) {
        }
        advanceLine() {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            // Using Math.round so that the text is not blurred. If you are curious to see, just take away the Math.round
            let lineHeight = Math.round(_DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin);
            // Checks if the next two lines after the advance would still be within the canvas boundaries
            //if I did not add the 2 line check, then the advance of the canvas and line wrapping would mess up the console
            if (this.currentYPosition + (2 * lineHeight) > _Canvas.height) {
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
                _DrawingContext.drawImage(offscreenCanvas, 0, -2 * lineHeight);
                // Adjust the current Y position
                this.currentYPosition -= lineHeight;
                //still checks to see if the new Y position exceeds the canvas height
                //}else if (this.currentYPosition + lineHeight > _Canvas.height) {
                //     // Existing logic for shifting content upward by one line
                //     // Create an offscreen canvas
                //     let offscreenCanvas = document.createElement('canvas');
                //     offscreenCanvas.width = _Canvas.width;
                //     offscreenCanvas.height = _Canvas.height;
                //     let offscreenCtx = offscreenCanvas.getContext('2d');
                //     // Copy the visible content of the main canvas onto the offscreen canvas
                //     offscreenCtx.drawImage(_Canvas, 0, 0);
                //     // Clear the main canvas
                //     _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
                //     // Draw the content from the offscreen canvas back onto the main canvas, but shifted upwards by one line
                //     _DrawingContext.drawImage(offscreenCanvas, 0, -lineHeight);
            }
            else {
                this.currentYPosition += lineHeight;
            }
        }
    }
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map