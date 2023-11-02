module TSOS {
    export class PCB {
        public pid: number = 0;
        public location: string = "Memory";
        public PC: number = 0;
        public IR: number = 0;
        public Acc: number = 0;
        public Xreg: number = 0;
        public Yreg: number = 0;
        public Zflag: number = 0;
        public state: string = "Resident";
        public base: number = 0;
        public limit: number = 0;
        public priority: number = 0;
        public arrivalTime: number;
        public completionTime: number | null = null;
        public burstTime: number | null = null;
        public turnaroundTime: number | null = null;
        public waitTime: number | null = null;
        public quantumRemaining = _Scheduler.quantum;
        public segment: number | null = null;



        constructor(pid?: number, base?: number, limit?: number) {
            if (pid !== undefined) {
                this.pid = pid;
            }
            if (base !== undefined) {
                this.base = base;
            }
            if (limit !== undefined) {
                this.limit = limit;
            }
        }

        public updateState(newState: string): void {
            this.state = newState;
        }

        public reset(): void {
            this.PC = this.base;
            this.IR = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.state = "Resident";
            this.waitTime = 0;
        }

        // public static loadRun(pcb): void {
        //     _CPU.currentPCB = pcb;
        //     pcb.state = "Running";
        //     Control.updatePCBs();
        //     _CPU.loadStateFromPCB(pcb);
        //     _CPU.isExecuting = true;
        // }
    }
}