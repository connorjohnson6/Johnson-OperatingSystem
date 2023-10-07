var TSOS;
(function (TSOS) {
    class PCB {
        pid = 0; // Process ID
        location = "Memory"; // Location
        PC = 0; // Program Counter
        IR = 0; // Instruction Reg
        Acc = 0; // Accumulator
        Xreg = 0; // X register
        Yreg = 0; // Y register
        Zflag = 0; // Z flag (zero flag)
        state = "Resident"; // State of the process (e.g., "new", "running", "terminated")
        constructor(pid) {
            if (pid !== undefined) {
                this.pid = pid;
            }
        }
        static loadRun(pcb) {
            // Set the current PCB in the CPU
            _CPU.currentPCB = pcb;
            // Set PCB state to running and update PCB display
            pcb.state = "Running";
            TSOS.Control.updatePCBs();
            // Load CPU state from the PCB before starting execution
            _CPU.loadStateFromPCB(pcb);
            // Set CPU execution flag to true
            _CPU.isExecuting = true;
            // no longe rneed this, krnOnCPUClockPulse handle this.
            // while (_CPU.isExecuting) {
            //     _CPU.cycle();
            // }
        }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map