module TSOS {
    export class Scheduler {
        public quantum: number = 6; // Default quantum value
        public readyQueue: Queue; // Queue to hold ready processes
        public residentList: Map<number, PCB>; // Mapping of PIDs to PCBs
        public runningProcess: number | null; // Currently running process PID
        public schedulingAlgorithm: string = "rr"; // Default to Round Robin
        public cycles: number; // Number of cycles


        public init(): void {
            this.readyQueue  = new Queue();
            this.residentList = new Map<number, PCB>();
            this.runningProcess = null;
            this.quantum = 6; // Set the initial quantum
            this.schedulingAlgorithm = "rr"; // Set the initial scheduling algorithm
            this.cycles = 0; // Set initial cycles
        }

        public switchContext(): void {
            if (this.schedulingAlgorithm === "rr" && this.cycles >= this.quantum) {
                if (!this.readyQueue.isEmpty()) {
                    let nextProcess = this.readyQueue.dequeue();
                    this.readyQueue.enqueue(_CPU.currentPCB);
                    _Dispatcher.contextSwitch(_CPU.currentPCB, nextProcess);
                    this.cycles = 0;
                }
            } else if (this.schedulingAlgorithm === "fcfs" || this.schedulingAlgorithm === "priority") {
                if (_CPU.isExecuting === false && !this.readyQueue.isEmpty()) {
                    let nextProcess = this.schedule();
                    //_Dispatcher.executeProcess(nextProcess);
                }
            }
        }


        public schedule(): PCB | null {
            console.log("Scheduling a new process");

            if (this.readyQueue.isEmpty()) {
                return null;
            }

            let nextProcess = null;

            switch (this.schedulingAlgorithm) {
                case "rr":
                    nextProcess = this.readyQueue.dequeue();
                    break;
                
                case "fcfs":
                    nextProcess = this.readyQueue.dequeue();
                    break;
                
                case "priority":
                    // Implement priority scheduling logic here
                    // For now, it behaves like FCFS
                    nextProcess = this.readyQueue.dequeue();
                    break;
                
                default:
                    console.error("Invalid scheduling algorithm");
                    return null;
            }

            return nextProcess;
        }

        public contextSwitch(): void {
            if (this.readyQueue.getSize() > 0) {
                let nextPCB = this.readyQueue.dequeue();
                _Dispatcher.contextSwitch(_CPU.currentPCB, nextPCB);
                this.readyQueue.enqueue(_CPU.currentPCB);
                _CPU.currentPCB = nextPCB;
                //TSOS.Control.updateReadyQueueDisplay(_Scheduler);
            }
            
            this.cycles = 0; // Reset the cycle counter after a context switch
        }

        public addProcess(pcb: PCB): void {
            this.readyQueue.enqueue(pcb);
            pcb.state = "Waiting";
        }

        

        public removeProcess(pid): PCB | null {
            return this.readyQueue.dequeue(); // Remove and return the next process from the ready queue
        }

        public killProcess(pid: number): void {
            this.removeProcess(pid);
            // Additional cleanup might be needed here
        }

        public getActiveProcesses(): PCB[] {
            return Array.from(this.residentList.values());
        }

        public terminateProcess(pid: number): void {
            let pcb = this.residentList.get(pid);
            if (pcb) {
                // Update the partition status to unoccupied
                let partition = _MemoryManager.getPartitionByBase(pcb.base);
                if (partition) {
                    partition.occupied = false;
                    partition.pcb = null;
                    
                    // Clear the memory in the partition
                    _MemoryAccessor.clearPartition(partition.base, partition.limit);
                }
                
                // Set PCB state to terminated
                pcb.state = "Terminated";
                
                // Remove the PCB from the residentList
                this.residentList.delete(pid);
            }
        }
        

        public terminateAllProcesses(): void {
            this.residentList.forEach(pcb => pcb.state = "Terminated");
            this.residentList.clear();
        }
        

        public setQuantum(quantum: number): void {
            this.quantum = quantum;
        }

        public getSchedulingAlgorithm(): string {
            return this.schedulingAlgorithm;
        }

        public setSchedulingAlgorithm(algorithm: string): void {
            this.schedulingAlgorithm = algorithm;
        }

        public executeProcess(pcb: PCB): void {
            // Update the PCB state to running
            pcb.state = "Running";
        
            // Load the PCB context into the CPU
            _CPU.PC = pcb.PC;
            _CPU.Acc = pcb.Acc;
            _CPU.Xreg = pcb.Xreg;
            _CPU.Yreg = pcb.Yreg;
            _CPU.Zflag = pcb.Zflag;
        
            _CPU.isExecuting = true;
        }
        
        
    }
}
