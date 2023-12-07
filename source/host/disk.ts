module TSOS {

    //storage structure
    export class Disk {
        trackCount: number;
        sectorCount: number;
        blockCount: number;
        blockMemory: number;
    
        constructor(trackCount: number = 4, sectorCount: number = 8, blockCount: number = 8, blockMemory: number = 64) {
            //  T | S | B
            this.trackCount = trackCount;
            this.sectorCount = sectorCount;
            this.blockCount = blockCount;
            this.blockMemory = blockMemory;
        }
    }
}