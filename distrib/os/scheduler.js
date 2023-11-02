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
            console.log("Attempting to switch context");
            this.cycles++; // Increment the cycle counter
            if (this.schedulingAlgorithm === "rr" && (this.cycles >= this.quantum || !_CPU.isExecuting)) {
                if (!this.readyQueue.isEmpty()) {
                    const currentProcess = _CPU.currentPCB;
                    this.readyQueue.enqueue(currentProcess); // <-- Add the current process back to the queue
                    //console.log("Ready queue contents:", JSON.stringify(this.readyQueue));
                    const nextProcess = this.readyQueue.dequeue();
                    //console.log("Current process being executed:", currentProcess);
                    //console.log("Next process to be executed:", nextProcess);
                    //console.log(`Process ${currentProcess} quantum remaining:`, currentProcess.quantumRemaining);
                    //console.log(`Process ${currentProcess} priority:`, currentProcess.priority);
                    _Dispatcher.contextSwitch(currentProcess, nextProcess);
                    this.cycles = 0;
                }
                if (this.runningProcess) {
                    console.log(`Context switched to PID: ${this.runningProcess}`);
                }
                else {
                    console.log("No process found to switch to");
                }
            }
            else if ((this.schedulingAlgorithm === "fcfs" || this.schedulingAlgorithm === "priority") && !_CPU.isExecuting) {
                const nextProcess = this.schedule();
                if (nextProcess) {
                    _Dispatcher.executeProcess(nextProcess);
                }
            }
        }
        saveState(pcb) {
            if (pcb) {
                pcb.PC = _CPU.PC;
                pcb.Acc = _CPU.Acc;
                pcb.Xreg = _CPU.Xreg;
                pcb.Yreg = _CPU.Yreg;
                pcb.Zflag = _CPU.Zflag;
            }
        }
        schedule() {
            if (this.readyQueue.isEmpty()) {
                return null;
            }
            let nextProcess = null;
            switch (this.schedulingAlgorithm) {
                case "rr":
                    nextProcess = this.roundRobinSchedule();
                    break;
                case "fcfs":
                case "priority":
                    nextProcess = this.readyQueue.dequeue();
                    break;
                default:
                    console.error("Invalid scheduling algorithm");
                    return null;
            }
            return nextProcess;
        }
        roundRobinSchedule() {
            // Simply get the next process in the queue
            return this.readyQueue.dequeue();
        }
        contextSwitch() {
            if (this.readyQueue.getSize() > 0) {
                let nextPCB = this.schedule();
                if (nextPCB) {
                    _Dispatcher.contextSwitch(_CPU.currentPCB, nextPCB);
                    this.readyQueue.enqueue(_CPU.currentPCB);
                    _CPU.currentPCB = nextPCB;
                }
            }
            this.cycles = 0; // Reset the cycle counter after a context switch
        }
        addProcess(pcb) {
            console.log(`Adding PID: ${pcb.pid} to the ready queue`);
            this.readyQueue.enqueue(pcb);
            console.log(`Process ${pcb.pid} state before execution:`, pcb.state);
            pcb.state = "Waiting";
        }
        removeProcess(pcb) {
            console.log(`Removing PID: ${pcb.pid} from the ready queue`);
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
        //long name I know lol
        clearReadyQueueIfAllProcessesTerminated() {
            //console.log("Checking if all processes in the ready queue are terminated");
            let anyActiveProcess = false; // Flag to check for any active process
            // Check if any process is in Resident or Ready state
            this.residentList.forEach(pcb => {
                if (pcb.state === "Resident" || pcb.state === "Ready") {
                    anyActiveProcess = true;
                    //console.log(`Active process found with PID: ${pcb.pid} and State: ${pcb.state}`);
                }
            });
            // Clear the ready queue if there's no active process
            if (!anyActiveProcess) {
                console.log("All processes terminated");
                //console.log("No active processes found. Clearing the ready queue.");
                this.readyQueue = new TSOS.Queue();
            }
            else {
                console.log("Not all processes terminated");
            }
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map