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

    
        public format(): void {
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

        public createFile(filename: string): boolean {
            // Check if the filename already exists.
            if (this.searchForFile(filename)) {
                _Kernel.krnTrace(`File creation failed: '${filename}' already exists.`);
                return false;
            }
        
            // Find the first available directory block.
            let dirBlock = this.findNextAvailableBlock();
            if (!dirBlock) {
                _Kernel.krnTrace(`File creation failed: No available blocks for directory entry.`);
                return false;
            }
        
            // Find the next available data block, which will be reserved for the file's data.
            let dataBlock = this.findNextAvailableDataBlock();
            if (!dataBlock) {
                _Kernel.krnTrace(`File creation failed: No available blocks for file data.`);
                return false;
            }
        
            // Convert the filename to hex representation for storage.
            let hexFileName = TSOS.Utils.textToHex(filename).toUpperCase();
        
            // Update the directory entry with the TSB of the next available data block and the hex filename.
            // Format: In Use flag, Next TSB, Hex filename
            let dirData = `1 ${dataBlock}`.padEnd(HEX_START_INDEX, " ") + hexFileName;
            sessionStorage.setItem(dirBlock, dirData);
        
            // Mark the data block as reserved by updating its "In Use" flag without adding any data yet.
            let dataBlockContent = `1 --- --- ---`;
            sessionStorage.setItem(dataBlock, dataBlockContent);
        
            _Kernel.krnTrace(`File '${filename}' created with directory entry in block ${dirBlock}.`);
            TSOS.Control.updateDiskDisplay(); // Refresh the disk display.
            return true;
        }
        


        private createEmptyBlock(): (number | string)[] {
            let emptyBlockMemory = new Array(64).fill("-"); // Fill the block with a representation of empty space.
            emptyBlockMemory.fill(0, 0, 4); // The first four elements indicate the TSB and usage flag.
            return emptyBlockMemory;
        }

        private searchForFile(filename: string): boolean {
            // Search for the file in the disk.
            for (let x = 0; x < _Disk.trackCount; x++) {
                for (let y = 0; y < _Disk.sectorCount; y++) {
                    for (let z = 0; z < _Disk.blockCount; z++) {
                        let key = `${x},${y},${z}`;
                        let blockData = sessionStorage.getItem(key);
                        if (blockData && blockData.includes(filename)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    
        private findNextAvailableBlock(): string | null {
            // Find the next available block to store the file.
            // Start searching from block 0,0,1 as 0,0,0 is reserved.
            for (let x = 0; x < _Disk.trackCount; x++) {
                for (let y = 0; y < _Disk.sectorCount; y++) {
                    for (let z = (x === 0 && y === 0) ? 1 : 0; z < _Disk.blockCount; z++) { // Skip block 0,0,0
                        let key = `${x},${y},${z}`;
                        let blockData = sessionStorage.getItem(key);
                        if (blockData && blockData.startsWith("0")) {
                            // Mark the block as used before returning it.
                            sessionStorage.setItem(key, `1 --- --- ---`);
                            return key;
                        }
                    }
                }
            }
            return null; // No available blocks found.
        }
        
        private findNextAvailableDataBlock(): string | null {
            // Start searching from block 1,0,0 for the next available data block.
            for (let x = 1; x < _Disk.trackCount; x++) {
                for (let y = 0; y < _Disk.sectorCount; y++) {
                    for (let z = 0; z < _Disk.blockCount; z++) {
                        let key = `${x},${y},${z}`;
                        let blockData = sessionStorage.getItem(key);
                        if (blockData && blockData.startsWith("0")) {
                            // Mark the block as used before returning it.
                            sessionStorage.setItem(key, `1 --- --- ---`);
                            return key;
                        }
                    }
                }
            }
            return null; // No available data blocks found.
        }
        





    }


}