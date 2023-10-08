module TSOS {
    export class PCB {
        public pid: number = 0;       // Process ID
        public location: string = "Memory"; // Location
        public PC: number = 0;     // Program Counter
        public IR: number = 0;     // Instruction Reg
        public Acc: number = 0;    // Accumulator
        public Xreg: number = 0;   // X register
        public Yreg: number = 0;   // Y register
        public Zflag: number = 0;  // Z flag (zero flag)
        public state: string = "Resident"; // State of the process (e.g., "new", "running", "terminated")

        constructor(pid?: number) {
            if (pid !== undefined) {
                this.pid = pid;
            }
          
        }

        public static loadRun(pcb): void {
            // Set the current PCB in the CPU
            _CPU.currentPCB = pcb;
        
            // Set PCB state to running and update PCB display
            pcb.state = "Running";
            Control.updatePCBs();
    
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
}