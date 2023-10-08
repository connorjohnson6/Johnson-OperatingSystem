var TSOS;
(function (TSOS) {
    class MemoryManager {
        static BLOCK_SIZE = 0xFF; // or 256
        constructor() { }
        static memorySpot(opCodes) {
            // Validate the input length
            if (opCodes.length > MemoryManager.BLOCK_SIZE) {
                _StdOut.putText("Error: Input exceeds block size.");
                _StdOut.advanceLine();
                _StdOut.putText(`Please enter your next command under this message:     >`);
                return;
            }
            else {
                // Load the op codes into memory
                for (let i = 0; i < opCodes.length; i++) {
                    _MemoryAccessor.write(i, parseInt(opCodes[i], 16));
                }
            }
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map