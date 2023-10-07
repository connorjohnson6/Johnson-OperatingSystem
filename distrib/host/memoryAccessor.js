var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        writeCount = 0;
        maxWriteCount = 0xFF;
        constructor() { }
        init() { }
        //Read a byte from a specific address in memory.
        read(address) {
            return _Memory[address];
        }
        // Write a byte to a specific address in memory.
        write(address, value) {
            _Memory[address] = value;
            TSOS.Control.updateMemory(address, value);
            if (_CPU.Yreg > 0XFF) {
                // Terminate process or take other appropriate action
                _CPU.isExecuting = false;
                _CPU.init(); // re-initialize or clear CPU state
                if (_CPU.currentPCB) {
                    _CPU.currentPCB.state = "Terminated";
                    TSOS.Control.updatePCBs();
                    _StdOut.putText(`Process ${_CPU.currentPCB.pid} has been manually terminated`);
                }
                TSOS.Kernel.krnTrapError("Potential infinite loop detected: too many write operations");
            }
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map