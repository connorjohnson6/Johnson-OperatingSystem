/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

     module TSOS {

        export class Console {
    
            constructor(public currentFont = _DefaultFontFamily,
                        public currentFontSize = _DefaultFontSize,
                        public currentXPosition = 0,
                        public currentYPosition = _DefaultFontSize,
                        public buffer = "") {
            }
    
            public init(): void {
                this.clearScreen();
                this.resetXY();
            }
    
            public clearScreen(): void {
                _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
            }
    
            public resetXY(): void {
                this.currentXPosition = 0;
                this.currentYPosition = this.currentFontSize;
            }
    
            public handleInput(): void {
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
                    }else if(chr === String.fromCharCode(8)){ 
                        //handles the backsapce command
                    }else if(chr === String.fromCharCode(38)){
                        //handles up arrow
                    }else if(chr === String.fromCharCode(40)){
                        //handles down arrow   
                    } else {
                        // This is a "normal" character, so ...
                        // ... draw it on the screen...
                        this.putText(chr);
                        // ... and add it to our buffer.
                        this.buffer += chr;
                    }
                    // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
                }
            }
    
            public putText(text): void {
                /*  My first inclination here was to write two functions: putChar() and putString().
                    Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                    between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                    So rather than be like PHP and write two (or more) functions that
                    do the same thing, thereby encouraging confusion and decreasing readability, I
                    decided to write one function and use the term "text" to connote string or char.
                */
                if (text !== "") {
                    // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                    // Move the current X position.
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                    this.currentXPosition = this.currentXPosition + offset;
                }
             }
    
    

            public advanceLine(): void {
                this.currentXPosition = 0;
                /*
                 * Font size measures from the baseline to the highest point in the font.
                 * Font descent measures from the baseline to the lowest point in the font.
                 * Font height margin is extra spacing between the lines.
                 */

                //using Math.round so that the text is not blurred. If you are curious to see, just take away the Math.round
                let lineHeight = Math.round(_DefaultFontSize + 
                                 _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                 _FontHeightMargin);


                // Check if the new Y position would exceed the canvas height
                if (this.currentYPosition + lineHeight > _Canvas.height) {

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
            
                    // Draw the content from the offscreen canvas back onto the main canvas, but shifted upwards by one line
                    _DrawingContext.drawImage(offscreenCanvas, 0, -lineHeight);
            
                } else {
                    this.currentYPosition += lineHeight;
                }
    
            }
        }
     }