var TSOS;
(function (TSOS) {
    class PCB {
        // The PCB constructor initializes the process with default values.
        // The state is set to "new" by default, indicating a new process.
        pid; // Process ID
        PC = 0; // Program Counter
        Acc = 0; // Accumulator
        Xreg = 0; // X register
        Yreg = 0; // Y register
        Zflag = 0; // Z flag (zero flag)
        state = "running" || "executing" || "completed"; // State of the process (e.g., "new", "running", "terminated")
        constructor() { }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map