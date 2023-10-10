/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
//
// Control Services
//
var TSOS;
(function (TSOS) {
    class Control {
        static hostInit() {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            //area is not allowing my terminal to operate -- might have fixed it...score!
            _CPU = new TSOS.Cpu();
            _CPU.init();
            _Memory = new TSOS.Memory();
            _Memory.init();
            _MemoryAccessor = new TSOS.MemoryAccessor();
            const memoryTable = document.getElementById('memoryTable');
            function createTableCell(value) {
                const cell = document.createElement('td');
                cell.innerText = value;
                return cell;
            }
            // Creates a table row (tr) with the given address value as its header (th) and a specified number of cells.
            function createTableRow(addressValue, cellsCount) {
                const row = document.createElement('tr');
                const address = document.createElement('th');
                address.innerText = addressValue;
                row.appendChild(address);
                for (let j = 0; j < cellsCount; j++) {
                    row.appendChild(createTableCell("00"));
                }
                return row;
            }
            const START = 0x000;
            const END = 0x2F8;
            const STEP = 8;
            const CELLS_PER_ROW = 8;
            // Loop through the memory address range and create rows for the memory table.
            for (let i = START; i <= END; i += STEP) {
                const addressValue = "0x" + TSOS.Utils.convertHexString(i, 3); // Convert the address to a hex string.
                const row = createTableRow(addressValue, CELLS_PER_ROW);
                memoryTable.appendChild(row); // Add the created row to the memory table.
            }
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }
        //credit from looking at the hall of fame KeeDOS
        //put back all updates back into the control.ts due to Labouseur saying it in class
        static updateMemory(address, value) {
            const column = (address % 8) + 2;
            const row = Math.floor(address / 8) + 1;
            const cellSelector = `#memoryTable > tr:nth-child(${row}) > td:nth-child(${column})`;
            const cell = document.querySelector(cellSelector);
            if (cell) {
                cell.innerText = TSOS.Utils.convertHexString(value, 2);
            }
        }
        static updatePCBs() {
            const pcbTableBody = document.querySelector("#tablePCB > tbody");
            pcbTableBody.innerHTML = ''; // Clear existing rows
            _PCBMap.forEach((pcb) => {
                const row = document.createElement('tr');
                // Create and append cells for each property of pcb
                const properties = ['pid', 'state', 'location', 'PC', 'IR', 'Acc', 'Xreg', 'Yreg', 'Zflag'];
                properties.forEach(prop => {
                    const cell = document.createElement('td');
                    if (prop === 'Zflag') {
                        cell.textContent = pcb[prop] ? '1' : '0';
                    }
                    else if (['PC', 'IR', 'Acc', 'Xreg', 'Yreg'].includes(prop)) {
                        cell.textContent = TSOS.Utils.convertHexString(pcb[prop], 2);
                    }
                    else {
                        cell.textContent = pcb[prop].toString();
                    }
                    row.appendChild(cell);
                });
                // Append the row to the table body
                pcbTableBody.appendChild(row);
            });
        }
        static updateCPU() {
            const cpuTableBody = document.querySelector("#tableCpu > tbody");
            cpuTableBody.innerHTML = ''; // Clear existing rows
            const row = document.createElement('tr');
            // Define CPU properties to display
            const cpuProperties = ['PC', 'IR', 'Acc', 'Xreg', 'Yreg', 'Zflag'];
            cpuProperties.forEach(prop => {
                const cell = document.createElement('td');
                if (prop === 'Zflag') {
                    cell.textContent = _CPU[prop] ? '1' : '0';
                }
                else {
                    cell.textContent = TSOS.Utils.convertHexString(_CPU[prop], 2);
                }
                row.appendChild(cell);
            });
            // Append the row to the table body
            cpuTableBody.appendChild(row);
        }
        static hostLog(msg, source = "?") {
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        }
        //
        // Host Events
        //
        static hostBtnStartOS_click(btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        }
        static hostBtnHaltOS_click(btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }
        static hostBtnReset_click(btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload();
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
        static hostBtnToggleSS_click(btn) {
            // Toggle single-step mode
            _CPU.singleStepMode = !_CPU.singleStepMode;
        }
        static hostBtnStep_click(btn) {
            // If in single-step mode, perform one CPU cycle
            if (_CPU.singleStepMode && _CPU.currentPCB.state != "Terminated") {
                _CPU.cycle();
            }
        }
    }
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=control.js.map