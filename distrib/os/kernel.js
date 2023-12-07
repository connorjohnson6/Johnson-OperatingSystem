/* ------------
     Kernel.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    class Kernel {
        static krnShutdown;
        pidCounter = 0;
        nextPID = 0;
        constructor() {
        }
        //
        // OS Startup and Shutdown Routines
        //
        krnBootstrap() {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.
            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            // Initialize the console.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.
            _Console.init();
            _Scheduler = new TSOS.Scheduler();
            _Scheduler.init();
            _Dispatcher = new TSOS.Dispatcher();
            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;
            TSOS.Control.updateQuantumDisplay(_Scheduler.quantum);
            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);
            // Load the Disk Device Driver
            this.krnTrace("Loading the Disk device driver.");
            _krnKeyboardDisk = new TSOS.DeviceDriverDisk(); // Construct it.
            _krnKeyboardDisk.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDisk.status);
            //
            // ... more?
            //
            //_MemoryManager = new memoryManager(); //this shit just breaks everything, don't know why, don't know how other then my prediction on it making a new instance
            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();
            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }
        krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        }
        krnOnCPUClockPulse() {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.
            */
            // Check for an interrupt, if there are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO (maybe): Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
                // If there are no interrupts then run one CPU cycle if there is anything being processed.
            }
            else if (_CPU.isExecuting && !_CPU.singleStepMode) {
                _CPU.cycle();
                _Scheduler.switchContext(); // Check if a context switch is needed
            }
            else {
                // If there are no interrupts and there is nothing being executed then just be idle.                  
                this.krnTrace("Idle");
                // If no process is currently executing, get the next process from the scheduler
                let nextProcess = _Scheduler.schedule();
                // Assuming schedule() returns the next process to execute
                if (nextProcess) {
                    _Dispatcher.executeProcess(nextProcess);
                }
            }
        }
        //
        // Interrupt Handling
        //
        krnEnableInterrupts() {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }
        krnDisableInterrupts() {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }
        // public krnLoadsMemory(taProgramInput) {
        //     // Send to memory
        //     Memory.loadIntoMemory(taProgramInput);
        //     let pid = _Kernel.getNextPID(); 
        //     let newPCB = new PCB(pid); 
        //     _MemoryManager.loadProcess(newPCB, taProgramInput.split(" "));
        // }
        // public krnRun(pcb) {
        //     // run the pcb and cpu
        //     _Scheduler.executeProcess(pcb);
        // }
        getNextPID() {
            return this.nextPID++;
        }
        getPCB(pid) {
            // First, try to get the PCB from the Scheduler's residentList
            let pcb = _Scheduler.residentList.get(pid);
            // If not found in the residentList, try to get it from the global _PCBMap
            if (!pcb) {
                pcb = _PCBMap.get(pid) || null;
            }
            return pcb;
        }
        static krnLoadProcess(taProgramInput) {
            let pcb = _MemoryManager.loadProcess(taProgramInput);
            _Scheduler.addProcess(pcb);
        }
        krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);
            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case CONTEXT_SWITCH_IRQ:
                    let oldPCB = _CPU.currentPCB;
                    let newPCB = params;
                    _Dispatcher.contextSwitch(oldPCB, newPCB);
                    break;
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                default:
                    Kernel.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }
        krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
            // Or do it elsewhere in the Kernel. We don't really need this.
        }
        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile
        //
        // OS Utility Routines
        //
        krnTrace(msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would quickly lag the browser quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                    }
                }
                else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        }
        static krnTrapError(msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            //call for the console to update the CLI
            _Console.displayBSOD();
            this.krnShutdown();
        }
    }
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=kernel.js.map