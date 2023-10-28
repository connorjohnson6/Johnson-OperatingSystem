var TSOS;
(function (TSOS) {
    class Scheduler {
        quantum = 6; // Default quantum value
        readyQueue; // Queue to hold ready processes
        residentList; // Mapping of PIDs to PCBs
        runningProcess; // Currently running process PID
        schedulingAlgorithm = "rr"; // Default to Round Robin
        cycles; // Number of cycles
        init() {
            this.readyQueue = new TSOS.Queue();
            this.residentList = new Map();
            this.runningProcess = null;
            this.quantum = 6; // Set the initial quantum
            this.schedulingAlgorithm = "rr"; // Set the initial scheduling algorithm
            this.cycles = 0; // Set initial cycles
        }
        switchContext() {
            if (this.schedulingAlgorithm === "rr" && this.cycles >= this.quantum) {
                if (!this.readyQueue.isEmpty()) {
                    let nextProcess = this.readyQueue.dequeue();
                    this.readyQueue.enqueue(_CPU.currentPCB);
                    _Dispatcher.contextSwitch(_CPU.currentPCB, nextProcess);
                    this.cycles = 0;
                }
            }
            else if (this.schedulingAlgorithm === "fcfs" || this.schedulingAlgorithm === "priority") {
                if (_CPU.isExecuting === false && !this.readyQueue.isEmpty()) {
                    let nextProcess = this.schedule();
                    //_Dispatcher.executeProcess(nextProcess);
                }
            }
        }
        schedule() {
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
        contextSwitch() {
            if (this.readyQueue.getSize() > 0) {
                let nextPCB = this.readyQueue.dequeue();
                _Dispatcher.contextSwitch(_CPU.currentPCB, nextPCB);
                this.readyQueue.enqueue(_CPU.currentPCB);
                _CPU.currentPCB = nextPCB;
                //TSOS.Control.updateReadyQueueDisplay(_Scheduler);
            }
            this.cycles = 0; // Reset the cycle counter after a context switch
        }
        addProcess(pcb) {
            this.readyQueue.enqueue(pcb);
            pcb.state = "Waiting";
        }
        removeProcess(pid) {
            return this.readyQueue.dequeue(); // Remove and return the next process from the ready queue
        }
        killProcess(pid) {
            this.removeProcess(pid);
            // Additional cleanup might be needed here
        }
        getActiveProcesses() {
            return Array.from(this.residentList.values());
        }
        terminateProcess(pid) {
            let pcb = this.residentList.get(pid);
            if (pcb) {
                // Update the partition status to unoccupied
                pcb.state = "Terminated";
                let partition = _MemoryManager.findPartitionByPID(pid);
                if (partition) {
                    partition.occupied = false;
                    partition.pcb = null;
                    // Clear the memory in the partition
                    _MemoryAccessor.clearPartition(partition.base, partition.limit);
                }
                // Remove the PCB from the residentList
                this.residentList.delete(pid);
                // If the terminated process was currently running, switch context to the next process in the ready queue
                if (this.runningProcess === pid) {
                    this.runningProcess = null; // Clear the running process
                    this.switchContext(); // Switch context to the next process in the ready queue
                }
                this.clearReadyQueueIfAllProcessesTerminated();
            }
        }
        terminateAllProcesses() {
            this.residentList.forEach(pcb => pcb.state = "Terminated");
            this.residentList.clear();
            this.clearReadyQueueIfAllProcessesTerminated();
        }
        setQuantum(quantum) {
            this.quantum = quantum;
        }
        getSchedulingAlgorithm() {
            return this.schedulingAlgorithm;
        }
        setSchedulingAlgorithm(algorithm) {
            this.schedulingAlgorithm = algorithm;
        }
        executeProcess(pcb) {
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
        clearReadyQueueIfAllProcessesTerminated() {
            let anyActiveProcess = false; // Flag to check for any active process
            // Check if any process is in Resident or Ready state
            this.residentList.forEach(pcb => {
                if (pcb.state === "Resident" || pcb.state === "Ready") {
                    anyActiveProcess = true;
                    console.log(`Active process found with PID: ${pcb.pid} and State: ${pcb.state}`);
                }
            });
            // Clear the ready queue if there's no active process
            if (!anyActiveProcess) {
                console.log("No active processes found. Clearing the ready queue.");
                this.readyQueue = new TSOS.Queue();
            }
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map