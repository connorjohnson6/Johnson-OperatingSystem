module TSOS {

    export class DeviceDriverDisk extends DeviceDriver {
        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

    
        format(): void {
            _Kernel.krnTrace("Initiating format protocol for the Galactic Data Disk.");
            
            // Create a block of memory that represents an empty block in the disk.
            let emptyBlockMemory: (number | string)[] = this.createEmptyBlock();
    
            // Iterate through each track, sector, and block, setting them to empty.
            for (let x = 0; x < _Disk.trackCount; x++) {
                for (let y = 0; y < _Disk.sectorCount; y++) {
                    for (let z = 0; z < _Disk.blockCount; z++) {
                        // The first block (0,0,0) is set, don't touch, labby told us not to
                        if (x === 0 && y === 0 && z === 0) {
                            emptyBlockMemory[0] = 1; // The galaxy's origin block is now in use.
                            sessionStorage.setItem(`${x},${y},${z}`, emptyBlockMemory.join(" "));
                            emptyBlockMemory[0] = 0; // Reset for the rest of the blocks.
                        } else {
                            sessionStorage.setItem(`${x},${y},${z}`, emptyBlockMemory.join(" "));
                        }
                    }
                }
            }
    
            _Kernel.krnTrace("Death Star Disk format complete. The force is strong with this one.");
            TSOS.Control.updateDiskDisplay(); // Update display to reflect the formatted disk.
        }


        createEmptyBlock(): (number | string)[] {
            let emptyBlockMemory = new Array(64).fill("0"); // Fill the block with a representation of empty space.
            emptyBlockMemory.fill(0, 0, 4); // The first four elements indicate the TSB and usage flag.
            return emptyBlockMemory;
        }





    }


}