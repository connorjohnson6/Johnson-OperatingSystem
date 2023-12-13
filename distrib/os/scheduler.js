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
            this.updateWaitTimes(); // Update the wait times for all processes in the ready queue
            if (this.schedulingAlgorithm === "rr" && (this.cycles >= this.quantum || !_CPU.isExecuting)) {
                if (_CPU.currentPCB && _CPU.currentPCB.state !== "Terminated") {
                    console.log(`[RR] Context switch requested for PID: ${_CPU.currentPCB.pid}, State: ${_CPU.currentPCB.state}`);
                    // Get the next PCB in the ready queue
                    let nextPCB = this.readyQueue.peek();
                    // Check if disk input is true and next PCB is on disk
                    if (_IsDiskLoaded === true && nextPCB && nextPCB.location === 'Disk') {
                        console.log(`[RR] Next PCB with PID: ${nextPCB.pid} is on Disk, rolling in`);
                        _Dispatcher.rollIn(nextPCB);
                        // Roll out the current PCB if it's not the same as the next PCB
                        if (_CPU.currentPCB.pid !== nextPCB.pid) {
                            _Dispatcher.rollOut(_CPU.currentPCB);
                        }
                    }
                    // Proceed with regular context switch
                    _Dispatcher.contextSwitch(_CPU.currentPCB, nextPCB);
                    console.log(`[RR] Context switch executed between PID: ${_CPU.currentPCB.pid} and PID: ${nextPCB ? nextPCB.pid : 'null'}`);
                }
                else {
                    _CPU.isExecuting = false;
                    this.runningProcess = null;
                    console.log("[RR] No current process or process terminated. Stopping execution.");
                }
                this.cycles = 0; // Reset cycles after a context switch
                console.log("[RR] Cycles reset after context switch");
            }
            else if ((this.schedulingAlgorithm === "fcfs" || this.schedulingAlgorithm === "priority") && !_CPU.isExecuting) {
                // Handle FCFS and Priority scheduling
                let nextPCB = this.schedule();
                if (nextPCB) {
                    _Dispatcher.contextSwitch(null, nextPCB); // Start next process
                    console.log(`[FCFS/Priority] Context switch to PID: ${nextPCB.pid}`);
                }
                else {
                    console.log("[FCFS/Priority] No process scheduled.");
                }
            }
        }
        getLastPCB() {
            // Check if the ready queue is empty
            if (this.readyQueue.isEmpty()) {
                return null;
            }
            // Get the last element from the ready queue
            const queueArray = this.readyQueue.toArray();
            return queueArray[queueArray.length - 1];
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
        terminateProcess(pid) {
            let pcb = this.residentList.get(pid);
            console.log(`Ready Queue before termination of PID ${pid}: ` + JSON.stringify(this.readyQueue.toArray().map(pcb => pcb.pid)));
            if (pcb && pcb.state !== "Terminated") {
                // Calculate process metrics for turnaround/wait times
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
                // unload the process using the correct PCB
                _MemoryManager.unloadProcess(pcb);
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
                // If this process was the running process, switch context
                if (this.runningProcess === pid) {
                    this.runningProcess = null;
                    if (!this.readyQueue.isEmpty()) {
                        this.switchContext();
                    }
                    else {
                        _CPU.isExecuting = false;
                    }
                }
            }
            else {
                console.log(`No process with PID ${pid} found.`);
            }
        }
        terminateAllProcesses() {
            this.residentList.forEach(pcb => pcb.state = "Terminated");
            this.residentList.clear();
            //theres that long name again lol
            this.clearReadyQueueIfAllProcessesTerminated();
        }
        //getters and setters
        setQuantum(quantum) {
            this.quantum = quantum;
        }
        setSchedulingAlgorithm(algorithm) {
            this.schedulingAlgorithm = algorithm;
        }
        getSchedulingAlgorithm() {
            return this.schedulingAlgorithm;
        }
        getActiveProcesses() {
            return Array.from(this.residentList.values());
        }
        getProcessByPID(pid) {
            return this.residentList.get(pid);
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
        //long name huh 
        clearReadyQueueIfAllProcessesTerminated() {
            //I had this differenetly but then Mr. Chat GPT decided to change it
            let activeProcesses = Array.from(this.residentList.values()).filter(pcb => pcb.state !== "Terminated");
            if (activeProcesses.length === 0) {
                console.log("No active processes found. Clearing the ready queue.");
                this.readyQueue = new TSOS.Queue();
            }
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
            this.readyQueue = new TSOS.Queue();
            filteredQueue.forEach(pcb => this.readyQueue.enqueue(pcb));
        }
        updateWaitTimes() {
            for (const pcb of this.readyQueue.toArray()) {
                if (pcb.state !== "Running") {
                    pcb.waitTime++;
                }
            }
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map