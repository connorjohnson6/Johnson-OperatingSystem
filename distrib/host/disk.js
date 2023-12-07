var TSOS;
(function (TSOS) {
    //storage structure
    class Disk {
        trackCount;
        sectorCount;
        blockCount;
        blockMemory;
        constructor(trackCount = 4, sectorCount = 8, blockCount = 8, blockMemory = 64) {
            //  T | S | B
            this.trackCount = trackCount;
            this.sectorCount = sectorCount;
            this.blockCount = blockCount;
            this.blockMemory = blockMemory;
        }
    }
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=disk.js.map