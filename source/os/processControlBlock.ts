module TSOS {
    export class PCB {
        public pid: number = 0;       // Process ID
        public location: string; // Location
        public PC: number = 0;     // Program Counter
        public IR: number = 0;     // Instruction Reg
        public Acc: number = 0;    // Accumulator
        public Xreg: number = 0;   // X register
        public Yreg: number = 0;   // Y register
        public Zflag: number = 0;  // Z flag (zero flag)
        public state: string; // State of the process (e.g., "new", "running", "terminated")

        constructor(pid?: number) {
            if (pid !== undefined) {
                this.pid = pid;
            }
          
        }
        

        public init() {
            this.PC = 0;
            this.location = "Memory";
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.state = "Resident"
            TSOS.Control.updatePCBs()
        }
    }
}
