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
                // Update state of the PCB to "Waiting"
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
            // Update the state of the PCB to "Running"
            pcb.state = "Running";
        }
        contextSwitch(oldPCB, newPCB) {
            this.saveState(oldPCB); // Save state of the currently executing process
            this.loadState(newPCB); // Load state for the next process to execute
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map