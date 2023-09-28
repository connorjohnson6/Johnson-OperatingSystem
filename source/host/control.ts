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
module TSOS {

    export class Control {


        public static hostInit(): void {

            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();


            //area is not allowing my terminal to operate -- might have fixed it...score!
            _CPU = new Cpu();	
            _CPU.init();
            _Memory	= new Memory();
            _Memory.init();
            _MemoryAccessor	= new MemoryAccessor();



            const memoryTable = document.getElementById('memoryTable')!

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
                const addressValue = "0x" + Utils.toHexString(i, 3); // Convert the address to a hex string.
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


        public static updatePCBs() {
            const pcbTableBody = (<HTMLTableSectionElement>document.querySelector("#tablePCB > tbody"));
            pcbTableBody.innerHTML = ''; // Clear existing rows
        
            _PCBMap.forEach((pcb) => {
                const row = document.createElement('tr');
        
                // Create and append cells for each property of pcb
                const properties = ['pid', 'state', 'location', 'PC', 'IR', 'Acc', 'Xreg', 'Yreg', 'Zflag'];
                properties.forEach(prop => {
                    const cell = document.createElement('td');
                    if (prop === 'Zflag') {
                        cell.textContent = pcb[prop] ? '1' : '0';
                    } else if (['PC', 'IR', 'Acc', 'Xreg', 'Yreg'].includes(prop)) {
                        cell.textContent = Utils.toHexString(pcb[prop], 2);
                    } else {
                        cell.textContent = pcb[prop].toString();
                    }
                    row.appendChild(cell);
                });
        
                // Append the row to the table body
                pcbTableBody.appendChild(row);
            });
        }
        

        // public static updateCPU() {
        //     const cpuTableBody = (<HTMLTableSectionElement>document.querySelector("#tableCpu > tbody"))
        //     const row = document.createElement('tr')
        //     row.innerHTML = `
        //         <td>${Utils.toHexString(_CPU.PC, 2)}</td>
        //         <td>${Utils.toHexString(_CPU.IR, 2)}</td>
        //         <td>${Utils.toHexString(_CPU.Acc, 2)}</td>
        //         <td>${Utils.toHexString(_CPU.Xreg, 2)}</td>
        //         <td>${Utils.toHexString(_CPU.Yreg, 2)}</td>
        //         <td>${_CPU.Zflag ? "1" : "0"}</td>
        //     `

        //     cpuTableBody.replaceChildren(row)
        // }



        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload();
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
    }
}
