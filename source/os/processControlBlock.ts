module TSOS {
    export class PCB {
        // The PCB constructor initializes the process with default values.
        // The state is set to "new" by default, indicating a new process.
        constructor(public pid: number,       // Process ID
                    public PC: number = 0,     // Program Counter
                    public Acc: number = 0,    // Accumulator
                    public Xreg: number = 0,   // X register
                    public Yreg: number = 0,   // Y register
                    public Zflag: number = 0,  // Z flag (zero flag)
                    public state: string = "new") {}  // State of the process (e.g., "new", "running", "terminated")
    }
}
