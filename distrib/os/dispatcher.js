var TSOS;
(function (TSOS) {
    class Dispatcher {
        executeProcess(pcb) {
            if (pcb.state !== "Terminated") {
                console.log(`Executing Process ${pcb.pid}`);
                this.loadState(pcb);
                _CPU.isExecuting = true;
            }
            else {
                console.log(`Process ${pcb.pid} is already terminated.`);
            }
        }
        saveState(pcb) {
            if (pcb) {
                pcb.PC = _CPU.PC;
                pcb.Acc = _CPU.Acc;
                pcb.Xreg = _CPU.Xreg;
                pcb.Yreg = _CPU.Yreg;
                pcb.Zflag = _CPU.Zflag;
                pcb.state = "Waiting";
            }
        }
        loadState(pcb) {
            _CPU.PC = pcb.PC;
            _CPU.Acc = pcb.Acc;
            _CPU.Xreg = pcb.Xreg;
            _CPU.Yreg = pcb.Yreg;
            _CPU.Zflag = pcb.Zflag;
            _CPU.currentPCB = pcb;
            pcb.state = "Running";
        }
        contextSwitch(oldPCB, newPCB) {
            if (oldPCB !== null && oldPCB.state !== "Terminated") {
                oldPCB.state = "Waiting";
                this.saveState(oldPCB);
                _Scheduler.readyQueue.enqueue(oldPCB); // Re-add the current process if it's not terminated
            }
            if (newPCB !== null) {
                if (_Scheduler.readyQueue.getSize() > 0) {
                    _Scheduler.readyQueue.dequeue(); // Remove newPCB from the ready queue as it is now current
                }
                this.loadState(newPCB);
                _CPU.currentPCB = newPCB; // Make newPCB the currently executing process
                newPCB.state = "Running";
                _CPU.isExecuting = true; // Set the CPU to executing
                console.log(`Context Switched to PID: ${newPCB.pid}`);
            }
            else {
                // No process is currently running
                _CPU.isExecuting = false;
                _CPU.currentPCB = null;
            }
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map