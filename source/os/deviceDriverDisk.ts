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
            let dirData = `1 ${dataBlock}`.padEnd(HEX_START_INDEX , " ") + hexFileName;
            sessionStorage.setItem(dirBlock, dirData);
        
            // Mark the data block as reserved by updating its "In Use" flag without adding any data yet.
            let dataBlockContent = `1 --- --- ---`;
            sessionStorage.setItem(dataBlock, dataBlockContent);
        
            _Kernel.krnTrace(`File '${filename}' created with directory entry in block ${dirBlock}.`);
            TSOS.Control.updateDiskDisplay(); // Refresh the disk display.
            return true;
        }

        //had chatGPT help me with this one. I had a good read method, just didn't go through
        //multi-lined inputed data, and it ended up infinite looping anyways. 
        //TODO: still need to implemet multi lined reads
        //Chatgpt really helped me debug this one, but it now can read the full written file
        public readFileData(startingBlockKey: string): string | null {
            let currentBlockKey = startingBlockKey;
            let fileDataHex = ""; // Store hex data from all blocks
            let visitedBlocks = new Set(); // Track visited blocks to prevent infinite loops
        
            
            while (currentBlockKey && currentBlockKey !== "---") {
                // Check if we've visited this block already to prevent an infinite loop
                if (visitedBlocks.has(currentBlockKey)) {
                    console.error("Infinite loop detected: Block", currentBlockKey, "already visited.");
                    return null;
                }
        
                visitedBlocks.add(currentBlockKey); // Mark this block as visited
        
                let blockData = sessionStorage.getItem(currentBlockKey);
                if (!blockData || blockData.charAt(0) !== "1") {
                    console.error("Invalid or empty block data at key:", currentBlockKey);
                    return null; // Block is not in use or doesn't exist, stop reading
                }
        
                // Extract the data part of the block and concatenate it
                let dataPart = blockData.substring(METADATA_SIZE).trim();
                fileDataHex += dataPart;
        
                // Get the 'Next' block key
                let nextBlockKey = this.getNextBlockKey(blockData);
                console.log(`Current block: ${currentBlockKey}, Data: ${dataPart}, Next block: ${nextBlockKey}`);

                if (nextBlockKey === currentBlockKey || !this.isValidTSB(nextBlockKey)) {
                    break; // If the 'Next' block is the current block or invalid, stop reading
                } else {
                    currentBlockKey = nextBlockKey; // Move to the next block
                }
            }
        
            if (fileDataHex === "") {
                console.error("No data found for file.");
                return null; // No data found or empty file
            } else {
                return TSOS.Utils.hexToText(fileDataHex); // Convert hex data to text and return it
            }
        }
        
        
        
        
        

        public writeFile(filename: string, data: string, currentBlockKey: string = null, clearBlocks: boolean = true): boolean {
            // Convert the data to a hex string for storage
            const hexData = TSOS.Utils.textToHex(data);
        
            // Check if a block key was provided
            if (!currentBlockKey) {
                // If no current block key is provided, find the directory entry and get the first data block key
                const dirEntry = this.findDirEntry(filename);
                if (!dirEntry) {
                    console.log(`File '${filename}' not found.`);
                    return false; // File not found
                }
                currentBlockKey = this.getDataBlockKey(dirEntry);
                if (!currentBlockKey) {
                    console.log(`No data block found for file '${filename}'.`);
                    return false; // No data block found for the file
                }
            }

            // Clear the previous data blocks linked to this file
            if (clearBlocks) {
                this.clearDataBlocks(currentBlockKey);
            }
        
            // Retrieve the current block's data
            let currentBlockData = sessionStorage.getItem(currentBlockKey);
            if (!currentBlockData) {
                console.log(`Block data not found for key '${currentBlockKey}'.`);
                return false; // Block data not found
            }
        
            // Determine how much data fits in the current block
            const blockSize = _Disk.blockMemory - METADATA_SIZE; // Assuming METADATA_SIZE accounts for metadata
            let dataToFit = hexData.substring(0, blockSize);
            let remainingData = hexData.substring(blockSize);
        
            // Write what fits into the current block
            let newBlockData = `1 ${currentBlockKey}`.padEnd(HEX_START_INDEX, " ") + dataToFit;
            sessionStorage.setItem(currentBlockKey, newBlockData);
            console.log(`Data written to block '${currentBlockKey}': ${dataToFit}`);
        
            // If there's remaining data, find the next available block and write to it
            if (remainingData.length > 0) {
                let nextBlockKey = this.findNextAvailableDataBlock();
                if (!nextBlockKey) {
                    console.log('No available blocks to continue writing data.');
                    return false; // No available blocks to continue writing
                }
        
                // Update the 'Next' pointer in the current block to the new block
                newBlockData = `1 ${nextBlockKey}`.padEnd(HEX_START_INDEX, " ") + dataToFit;
                sessionStorage.setItem(currentBlockKey, newBlockData);
        
                // Recursively write the remaining data to the new block
                return this.writeFile(filename, TSOS.Utils.hexToText(remainingData), nextBlockKey);
            }
        
            return true; // Data was written successfully
        }

        public deleteFile(filename: string): boolean {
            const dirEntryKey = this.findDirEntry(filename);
            if (!dirEntryKey) {
                console.log(`File '${filename}' not found.`);
                return false;
            }
        
            // Get the key for the file's first data block
            const dataBlockKey = this.getDataBlockKey(dirEntryKey);
            if (!dataBlockKey) {
                console.log(`Data block for file '${filename}' not found.`);
                return false;
            }
        
            // Clear the data blocks
            this.clearDataBlocks(dataBlockKey);
        
            // Clear the directory entry
            sessionStorage.setItem(dirEntryKey, this.createEmptyBlock().join(" "));
            return true;
        }
        

        
        public copyFile(existingFilename: string, newFilename: string): boolean {
            // Find the directory entry for the existing file.
            const existingDirEntryKey = _krnKeyboardDisk.findDirEntry(existingFilename);
            if (!existingDirEntryKey) {
                _StdOut.putText(`File '${existingFilename}' not found.`);
                return false;
            }
        
            // Check if the new filename already exists.
            if (_krnKeyboardDisk.findDirEntry(newFilename)) {
                _StdOut.putText(`File '${newFilename}' already exists.`);
                return false;
            }
        
            // Get the first data block key from the directory entry for the existing file.
            const existingDataBlockKey = _krnKeyboardDisk.getDataBlockKey(existingDirEntryKey);
            if (!existingDataBlockKey) {
                _StdOut.putText(`No data block found for file '${existingFilename}'.`);
                return false;
            }
        
            // Read the data from the existing file's data blocks.
            let existingFileData = _krnKeyboardDisk.readFileData(existingDataBlockKey);
            console.log(`Data from file to copy: ${existingFileData}`);
            if (existingFileData === null) {
                _StdOut.putText(`Error reading data for file '${existingFilename}'.`);
                return false;
            }
        
            // Create a new file with the new filename.
            let createSuccess = _krnKeyboardDisk.createFile(newFilename);
            console.log(`Created file: ${createSuccess}`);
            if (!createSuccess) {
                _StdOut.putText(`Error creating the file '${newFilename}'.`);
                return false;
            }
        
            // Write the data to the new file's data blocks.
            let writeSuccess = _krnKeyboardDisk.writeFile(newFilename, existingFileData);
            console.log(`Data written to new file: ${writeSuccess}`);
            if (!writeSuccess) {
                _StdOut.putText(`Error writing data to the file '${newFilename}'.`);
                return false;
            }
        
            return true;
        }
        
        
        
        
        
        
        public renameFile(existingFilename: string, newFilename: string): boolean {
            const dirEntryKey = _krnKeyboardDisk.findDirEntry(existingFilename);
            if (!dirEntryKey) {
                _StdOut.putText(`File '${existingFilename}' not found.`);
                return false;
            }
        
            if (_krnKeyboardDisk.findDirEntry(newFilename)) {
                _StdOut.putText(`File '${newFilename}' already exists.`);
                return false;
            }
        
            let dirBlockData = sessionStorage.getItem(dirEntryKey);
            if (dirBlockData) {
                const hexNewFilename = TSOS.Utils.textToHex(newFilename).toUpperCase();
                const updatedDirBlockData = dirBlockData.substring(0, HEX_START_INDEX) + hexNewFilename.padEnd(_Disk.blockMemory - HEX_START_INDEX, " ");
                sessionStorage.setItem(dirEntryKey, updatedDirBlockData);
                return true;
            } else {
                _StdOut.putText(`Error reading directory entry for file '${existingFilename}'.`);
                return false;
            }
        }

        public listAllFiles(): string[] {
            let fileList: string[] = [];
            // Assuming track 0 is reserved for directory entries
            for (let sector = 0; sector < _Disk.sectorCount; sector++) {
                for (let block = 0; block < _Disk.blockCount; block++) {
                    let key = `0,${sector},${block}`;
                    let blockData = sessionStorage.getItem(key);
                    if (blockData && blockData[0] === "1") { // If the block is in use
                        let fileNameHex = blockData.substring(METADATA_SIZE).trim();
                        let fileName = TSOS.Utils.hexToText(fileNameHex);
                        fileList.push(fileName);
                    }
                }
            }
            return fileList;
        }
        
    
        public findDirEntry(filename: string): string | null {
            for (let sector = 0; sector < _Disk.sectorCount; sector++) {
                for (let block = 0; block < _Disk.blockCount; block++) {
                    //files will always be on track 0
                    let key = `0,${sector},${block}`;
                    let blockData = sessionStorage.getItem(key);
                    if (blockData) {
                        let hexFileName = TSOS.Utils.textToHex(filename).toUpperCase();
                        if (blockData.substring(METADATA_SIZE).startsWith(hexFileName)) {
                            return key; // Found the directory entry, return its TSB key.
                        }
                    }
                }
            }
            return null; 
        }

        // Method to get the data block key from the directory entry
        public getDataBlockKey(dirEntryKey: string): string | null {
            const dirEntryData = sessionStorage.getItem(dirEntryKey);
            if (dirEntryData) {
                const nextTSB = dirEntryData.substring(1, METADATA_SIZE).trim(); // Trim to remove any padding spaces.
                // You need to validate if it's a valid TSB and return it.
                if (this.isValidTSB(nextTSB)) { 
                    return nextTSB;
                }
            }
            return null;
        }

        // Helper method to check if file is empty
        public isFileEmpty(dataBlockContent: string): boolean {

            const actualDataContent = dataBlockContent.substring(METADATA_SIZE).trim();
            
            // Check if the actual data part of the block is just hyphens, which represents empty data.
            return actualDataContent.split("").every(char => char === "-");
        }

        // was having some trouble with TSB information within my table, so just added
        // just incase of stupidity
        private isValidTSB(tsb: string): boolean {
            const parts = tsb.split(",");
            if (parts.length === 3) {
                return true;
            }
            return false;
        }
        
        private createEmptyBlock(): (number | string)[] {
            let emptyBlockMemory = new Array(64).fill("-"); // Fill the block with 'empty space'.
            emptyBlockMemory.fill(0, 0, 4);
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

        private getNextBlockKey(blockData: string): string {
            // Assuming that the TSB is stored right after the "in use" flag.
            // You might need to adjust the indices if your actual block data format is different.
            const nextTSB = blockData.substring(1, METADATA_SIZE).trim();
            return this.isValidTSB(nextTSB) ? nextTSB : "---";
        }
        
        

        private clearDataBlocks(startingBlockKey: string): void {
            let currentBlockKey = startingBlockKey;
            let blockData = sessionStorage.getItem(currentBlockKey);
        
            while (blockData) {
                // Clear the block data
                sessionStorage.setItem(currentBlockKey, this.createEmptyBlock().join(" "));
        
                // Check if there is a next block
                const nextBlockKey = blockData.substring(1, METADATA_SIZE).trim();
                if (nextBlockKey === '---' || !this.isValidTSB(nextBlockKey)) {
                    // No valid next block, stop clearing
                    break;
                } else {
                    // Continue with the next block
                    currentBlockKey = nextBlockKey;
                    blockData = sessionStorage.getItem(currentBlockKey);
                }
            }
        }





    }


}