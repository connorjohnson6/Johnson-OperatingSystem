var TSOS;
(function (TSOS) {
    class PCB {
        pid = 0; // Process ID
        location; // Location
        PC = 0; // Program Counter
        IR = 0; // Instruction Reg
        Acc = 0; // Accumulator
        Xreg = 0; // X register
        Yreg = 0; // Y register
        Zflag = 0; // Z flag (zero flag)
        state; // State of the process (e.g., "new", "running", "terminated")
        constructor(pid) {
            if (pid !== undefined) {
                this.pid = pid;
            }
        }
        init() {
            this.PC = 0;
            this.location = "Memory";
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            TSOS.Control.updatePCBs();
        }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map