/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }



        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";

            //thought this would be better then a bunch of if-else if statements
            //some special charcters will not show up, checked HallOfFame for 
            //ascii values too and they have the same
            const SHIFTED_CHAR_MAPPING = {
                '48': ')',
                '49': '!',
                '50': '@',
                '51': '#',
                '52': '$',
                '53': '%',
                '54': '^',
                '55': '&',
                '56': '*',
                '57': '(',
                '186': ':',
                '187': '+',
                '188': '<',
                '189': '_',
                '190': '>',
                '191': '?',
                '192': '~',
            };
         
            const UNSHIFTED_CHAR_MAPPING = {
                '48': '0',
                '49': '1',
                '50': '2',
                '51': '3',
                '52': '4',
                '53': '5',
                '54': '6',
                '55': '7',
                '56': '8',
                '57': '9',
                '186': ';',
                '187': '=',
                '188': ',',
                '189': '-',
                '190': '.',
                '191': '/',
                '192': '`',
                '219': '{',
                '220': '|',
                '221': '}',
                '222': '"'
            
            };

            if (isShifted) {
                chr = SHIFTED_CHAR_MAPPING[keyCode] || "";
            } else {
                chr = UNSHIFTED_CHAR_MAPPING[keyCode] || "";
            }


            
            // Handling letters (A-Z)
            if ((keyCode >= 65) && (keyCode <= 90)) {

                if (isShifted) {
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                } else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                _KernelInputQueue.enqueue(chr);

            //space, enter, backspace
            }else if ((keyCode == 32) || (keyCode == 13) || (keyCode == 8)){ //TODO: backspace check
                
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            
            }else { // Handling other special keys
               
                if (isShifted) {
                    chr = SHIFTED_CHAR_MAPPING[keyCode] || String.fromCharCode(keyCode);
                } else {
                    chr = String.fromCharCode(keyCode || SHIFTED_CHAR_MAPPING[keyCode]);
                }
                _KernelInputQueue.enqueue(chr);

            }
            
        }
    }
}
