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
            this.cycles++; // Increment the cycle counter
            if (this.schedulingAlgorithm === "rr" && (this.cycles >= this.quantum || !_CPU.isExecuting)) {
                if (_CPU.currentPCB && _CPU.currentPCB.state !== "Terminated") {
                    console.log(`Context switch requested for PID: ${_CPU.currentPCB.pid}, State: ${_CPU.currentPCB.state}`);
                    _Dispatcher.contextSwitch(_CPU.currentPCB, this.readyQueue.peek()); // Trigger context switch
                }
                else {
                    _CPU.isExecuting = false;
                    this.runningProcess = null; // No process is currently running
                }
                this.cycles = 0; // Reset cycles after a context switch
            }
            else if ((this.schedulingAlgorithm === "fcfs" || this.schedulingAlgorithm === "priority") && !_CPU.isExecuting) {
                let nextPCB = this.schedule();
                if (nextPCB) {
                    _Dispatcher.contextSwitch(null, nextPCB); // Start next process
                }
            }
        }
        // private saveState(pcb: PCB): void {
        //     if (pcb) {
        //         pcb.PC = _CPU.PC;
        //         pcb.Acc = _CPU.Acc;
        //         pcb.Xreg = _CPU.Xreg;
        //         pcb.Yreg = _CPU.Yreg;
        //         pcb.Zflag = _CPU.Zflag;
        //     }
        // }
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
                if (nextPCB && _CPU.currentPCB.state !== "Terminated") {
                    _Dispatcher.contextSwitch(_CPU.currentPCB, nextPCB); // trigger context switch
                }
            }
            this.cycles = 0; // Reset the cycle counter after a context switch
        }
        addProcess(pcb) {
            // Set the arrival time for the process
            pcb.arrivalTime = _OSclock;
            this.residentList.set(pcb.pid, pcb);
            this.readyQueue.enqueue(pcb);
            pcb.state = "Waiting";
        }
        removeProcess(pid) {
            // Remove and return the next process from the ready queue
            return this.readyQueue.dequeue();
        }
        getActiveProcesses() {
            return Array.from(this.residentList.values());
        }
        terminateProcess(pid) {
            let pcb = this.residentList.get(pid);
            console.log(`Ready Queue before termination of PID ${pid}: ` + JSON.stringify(this.readyQueue.toArray().map(pcb => pcb.pid)));
            if (pcb && pcb.state !== "Terminated") {
                // Calculate process metrics
                pcb.completionTime = _OSclock;
                pcb.turnaroundTime = pcb.completionTime - pcb.arrivalTime;
                if (pcb.burstTime !== null) {
                    pcb.waitTime = pcb.turnaroundTime - pcb.burstTime;
                }
                // Update memory partition status
                let partition = _MemoryManager.findProcessByPID(pid);
                if (partition) {
                    partition.occupied = false;
                    partition.pcb = null;
                    _MemoryAccessor.clearPartition(partition.base, partition.limit);
                }
                // Remove PCB from resident list
                this.residentList.delete(pid);
                this.removeFromReadyQueue(pid);
                // Check if the terminated process was the one currently running
                if (this.runningProcess === pid) {
                    this.runningProcess = null; // Clear the running process
                    // If there are no more processes to run, set CPU to not executing
                    if (this.readyQueue.isEmpty()) {
                        _CPU.isExecuting = false;
                    }
                    else {
                        // There are other processes to run, so perform a context switch
                        this.switchContext();
                    }
                }
                // Update process state and output termination message
                pcb.state = "Terminated";
                _MemoryManager.unloadProcess(_CPU.currentPCB);
                _StdOut.advanceLine();
                _StdOut.putText(`Process ${pcb.pid} terminated`);
                _StdOut.advanceLine();
                _StdOut.putText(`Turnaround time: ${pcb.turnaroundTime}`);
                _StdOut.advanceLine();
                _StdOut.putText(`Wait time: ${pcb.waitTime}`);
                _StdOut.advanceLine();
                console.log(`Ready Queue after termination of PID ${pid}: ` + JSON.stringify(this.readyQueue.toArray().map(pcb => pcb.pid)));
            }
            else {
                console.log(`No process with PID ${pid} found.`);
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
            // Instead of checking every PCB state, leverage the `filter` function
            let activeProcesses = Array.from(this.residentList.values()).filter(pcb => pcb.state !== "Terminated");
            if (activeProcesses.length === 0) {
                console.log("No active processes found. Clearing the ready queue.");
                this.readyQueue = new TSOS.Queue();
            }
        }
        getProcessByPID(pid) {
            return this.residentList.get(pid);
        }
        removeFromReadyQueue(pid) {
            let filteredQueue = [];
            // Remove the given PID from the readyQueue
            while (!this.readyQueue.isEmpty()) {
                let pcb = this.readyQueue.dequeue();
                if (pcb.pid !== pid) {
                    filteredQueue.push(pcb);
                }
            }
            // Reconstruct the readyQueue without the terminated process
            this.readyQueue = new TSOS.Queue(); // Assuming this initializes an empty queue
            filteredQueue.forEach(pcb => this.readyQueue.enqueue(pcb));
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map