var TSOS;
(function (TSOS) {
    class PCB {
        pid;
        PC;
        Acc;
        Xreg;
        Yreg;
        Zflag;
        state;
        // The PCB constructor initializes the process with default values.
        // The state is set to "new" by default, indicating a new process.
        constructor(pid, // Process ID
        PC = 0, // Program Counter
        Acc = 0, // Accumulator
        Xreg = 0, // X register
        Yreg = 0, // Y register
        Zflag = 0, // Z flag (zero flag)
        state = "new") {
            this.pid = pid;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.state = state;
        } // State of the process (e.g., "new", "running", "terminated")
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map