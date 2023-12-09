/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    class DeviceDriverKeyboard extends TSOS.DeviceDriver {
        ctrlDown = false; // Add a new property to hold state of Ctrl key
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
        krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }
        krnKbdDispatchKeyPress(params) {
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
                '222': '\"',
                '219': '{',
                '220': '|',
                '221': '}',
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
                '222': '\''
            };
            if (isShifted) {
                chr = SHIFTED_CHAR_MAPPING[keyCode] || "";
            }
            else {
                chr = UNSHIFTED_CHAR_MAPPING[keyCode] || "";
            }
            // If Ctrl key is pressed
            if (keyCode == 17) {
                this.ctrlDown = true;
                return;
            }
            // Check if Ctrl key is down and C is pressed simultaneously
            if (this.ctrlDown && keyCode == 67) { // 67 is the keyCode for 'C'
                //handles cancellation of the run properly
                if (_CPU.isExecuting == true) {
                    _CPU.isExecuting = false;
                    _CPU.init(); // re-initialize or clear CPU state
                    // Ensure currentPCB is not null before accessing its properties
                    if (_CPU.currentPCB) {
                        _CPU.currentPCB.state = "Terminated";
                        TSOS.Control.updatePCBs();
                        _StdOut.putText(`Process ${_CPU.currentPCB.pid} has been manually terminated`);
                    }
                    else {
                        _StdOut.putText(`No current process found.`);
                    }
                }
                _StdOut.advanceLine(); // Move to a new line on console
                _StdOut.putText(`Please enter your next command under this message:     >`);
                return;
            }
            // Reset the ctrlDown flag for other keys
            if (keyCode !== 17) {
                this.ctrlDown = false;
            }
            // Handling letters (A-Z)
            if ((keyCode >= 65) && (keyCode <= 90)) {
                if (isShifted) {
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                }
                else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                _KernelInputQueue.enqueue(chr);
                //space, enter, backspace
            }
            else if ((keyCode == 32) || (keyCode == 13) || (keyCode == 8)) { //TODO: backspace check
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            else { // Handling other special keys
                if (isShifted) {
                    chr = SHIFTED_CHAR_MAPPING[keyCode] || String.fromCharCode(keyCode);
                }
                else {
                    chr = String.fromCharCode(keyCode || SHIFTED_CHAR_MAPPING[keyCode]);
                }
                _KernelInputQueue.enqueue(chr);
            }
        }
    }
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverKeyboard.js.map