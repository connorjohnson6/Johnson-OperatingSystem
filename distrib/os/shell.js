/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    class Shell {
        // Properties
        promptStr = ">";
        commandList = [];
        curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        apologies = "[sorry]";
        constructor() { }
        init() {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            //date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date.");
            this.commandList[this.commandList.length] = sc;
            //whereami
            sc = new TSOS.ShellCommand(this.shellWhereami, "whereami", "- Displays the current whereami");
            this.commandList[this.commandList.length] = sc;
            //temp
            sc = new TSOS.ShellCommand(this.shellGame, "game", "- Roll my dice :)");
            this.commandList[this.commandList.length] = sc;
            //status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "- Status <string>");
            this.commandList[this.commandList.length] = sc;
            //BSOD
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", "- Displays when OS error occurred");
            this.commandList[this.commandList.length] = sc;
            //load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- See if your hex log is valid");
            this.commandList[this.commandList.length] = sc;
            //run
            sc = new TSOS.ShellCommand(this.shellRun, "run", " <PID> - run tests on OP Code");
            this.commandList[this.commandList.length] = sc;
            //clearmem
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "- clear all memory partitions");
            this.commandList[this.commandList.length] = sc;
            //runall
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "- execute all programs at once");
            this.commandList[this.commandList.length] = sc;
            //ps
            sc = new TSOS.ShellCommand(this.shellPs, "ps", "- display the PID and state of all processes");
            this.commandList[this.commandList.length] = sc;
            //kill
            sc = new TSOS.ShellCommand(this.shellKill, "kill", " <PID> - kill one process");
            this.commandList[this.commandList.length] = sc;
            //killall
            sc = new TSOS.ShellCommand(this.shellKillAll, "killall", "- kill all process");
            this.commandList[this.commandList.length] = sc;
            //quantum
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", " <int> - let the user set the Round Robin quantum (measured in cpu cycles)");
            this.commandList[this.commandList.length] = sc;
            //format
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "- Initialize all blocks in all sectors in all tracks");
            this.commandList[this.commandList.length] = sc;
            //create
            sc = new TSOS.ShellCommand(this.shellCreate, "create", " <filename> - Create the file filename");
            this.commandList[this.commandList.length] = sc;
            //read
            sc = new TSOS.ShellCommand(this.shellRead, "read", " <filename> - Read and display the contents of filename");
            this.commandList[this.commandList.length] = sc;
            //read
            sc = new TSOS.ShellCommand(this.shellWrite, "write", " <filename> \"data\" - Write the data inside the quotes to filename");
            this.commandList[this.commandList.length] = sc;
            //delete
            sc = new TSOS.ShellCommand(this.shellDelete, "delete", " <filename> - Remove filename from storage");
            this.commandList[this.commandList.length] = sc;
            //copy
            sc = new TSOS.ShellCommand(this.shellCopy, "copy", " <existing filename> <new filename> - Copy");
            this.commandList[this.commandList.length] = sc;
            //rename
            sc = new TSOS.ShellCommand(this.shellRename, "rename", " <existing filename> <new filename> - Rename");
            this.commandList[this.commandList.length] = sc;
            //ls
            sc = new TSOS.ShellCommand(this.shellLs, "ls", "- list the files currently on the disk");
            this.commandList[this.commandList.length] = sc;
            // Display the initial prompt.
            this.putPrompt();
        }
        putPrompt() {
            _StdOut.putText(this.promptStr);
        }
        handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args); // Note that args is always supplied, though it might be empty.
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }
        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        execute(fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }
        parseInput(buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }
        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }
        shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }
        shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        }
        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.
        shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }
        shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }
        shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }
        shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }
        //make more descriptions for the user
        shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "ver":
                        _StdOut.putText("Will give you the current version of the JohnsonTSOS");
                        break;
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Will kill the whole terminal");
                        break;
                    case "cls":
                        _StdOut.putText("Will clear the terminal");
                        break;
                    case "man":
                        _StdOut.putText("well... you are using this command so you know what you are doing");
                        break;
                    case "trace":
                        _StdOut.putText("I know what you are doing, check the host log ;)");
                        break;
                    case "rot13":
                        _StdOut.putText("Its almost like a ceasar cipher, becasue it is");
                        break;
                    case "prompt":
                        _StdOut.putText("You say something, and I'll spit it right back");
                        break;
                    case "date":
                        _StdOut.putText("Just the current date and time");
                        break;
                    case "whereami":
                        _StdOut.putText("Where are you? Where am I? ");
                        break;
                    case "game":
                        _StdOut.putText("A simple dice roll for bragging rights");
                        break;
                    case "status":
                        _StdOut.putText("tell me the status of your life, I'll display it for the world");
                        break;
                    case "bsod":
                        _StdOut.putText("Seems you have an OS error my good sir");
                        break;
                    case "load":
                        _StdOut.putText("loading op codes into memory");
                        break;
                    case "run":
                        _StdOut.putText("running to execute given op codes");
                        break;
                    case "clearmem":
                        _StdOut.putText("clear all spaces in memory");
                        break;
                    case "runall":
                        _StdOut.putText("run all PID operations");
                        break;
                    case "ps":
                        _StdOut.putText("display PID and state of processes");
                        break;
                    case "kill":
                        _StdOut.putText("kill a specific PID processes");
                        break;
                    case "killall":
                        _StdOut.putText("kill all PID processes");
                        break;
                    case "quantum":
                        _StdOut.putText("set speed of execution");
                        break;
                    case "format":
                        _StdOut.putText("Format the disk on the OS");
                        break;
                    case "create":
                        _StdOut.putText("Create a file inside of the disk");
                        break;
                    case "read":
                        _StdOut.putText("Read a file inside of the disk");
                        break;
                    case "write":
                        _StdOut.putText("Write to a created file");
                        break;
                    case "delete":
                        _StdOut.putText("Delete to a delete a file from disk");
                        break;
                    case "copy":
                        _StdOut.putText("Copy a file from disk and duplicate");
                        break;
                    case "rename":
                        _StdOut.putText("Rename a file from disk");
                        break;
                    case "ls":
                        _StdOut.putText("Ls to list out all current files on disk");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }
        shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }
        shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }
        shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
        shellDate(args) {
            //suprisingly, google's AI actually helped me with this when I was looking up the date function
            const today = new Date();
            const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
            const dateTime = date + ' ' + time;
            _StdOut.putText(dateTime);
        }
        shellWhereami(args) {
            _StdOut.putText('In a galaxy... far far away...');
            //I want to see if I can use the api to actually track IP addresses
            //https://ipapi.medium.com/ip-address-location-javascript-examples-82dd5d6da9cb
        }
        shellGame(args) {
            let min = 1;
            let max = 12;
            // Generate a random number between min and max
            let userRoll = Math.floor(Math.random() * (max - min + 1)) + min;
            let computerRoll = Math.floor(Math.random() * (max - min + 1)) + min;
            if (userRoll > computerRoll) {
                _StdOut.putText("You rolled a " + userRoll.toString() + " you beat me :(");
            }
            else if (userRoll < computerRoll) {
                _StdOut.putText("You rolled a " + userRoll.toString() + " but I beat you this time ;)");
            }
            else {
                _StdOut.putText("Well, I guess we are equally good at this game");
            }
        }
        shellStatus(args) {
            if (args.length > 0) {
                //switched up status as it was not working/turning the > in the terminal
                //to the status, which was an interesting problem
                let userStatus = args.join(" ");
                // Get the HTML element with the id "statusContainer"
                document.getElementById("statusContainer").innerText = `${userStatus}`;
                //Display status information in the terminal
                _StdOut.putText(`Status has been set to: ${userStatus}`);
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
        shellBSOD(args) {
            //this message isnt actually going to be displaying anything, you'll see
            TSOS.Kernel.krnTrapError("test");
        }
        shellLoad(args) {
            // Access the program input from the HTML textarea
            let taProgramInput = document.getElementById("taProgramInput").value.trim();
            let hexValidate = /^[0-9A-Fa-f\s]*$/;
            if (hexValidate.test(taProgramInput)) {
                _StdOut.putText("Hex is valid. Loading into memory...");
                _StdOut.advanceLine();
                // Generating a unique PID and creating a new PCB object
                let pid = _Kernel.getNextPID();
                let newPCB = new TSOS.PCB(pid);
                // Check if disk is formatted and memory is full
                if (_IsDiskFormatted && !_MemoryManager.findAvailablePartition()) {
                    // Bypass memory partition check and write to disk
                    let filename = `.swap${pid}`;
                    //let success = this.writeToDisk(filename, taProgramInput); // You need to implement this method
                    let success = _krnKeyboardDisk.createFile(filename);
                    if (success) {
                        _StdOut.putText(`Program loaded into disk with PID: ${pid}`);
                        TSOS.Control.updateDiskDisplay();
                    }
                    else {
                        _StdOut.putText("Failed to load program into disk.");
                    }
                }
                else if (_MemoryManager.loadProcess(newPCB, taProgramInput.split(" "))) {
                    _StdOut.putText(`Program loaded with PID: ${pid}`);
                }
                else {
                    _StdOut.putText("Program load failed.");
                    _StdOut.putText("Please format the disk to load more programs.");
                }
            }
            else {
                _StdOut.putText("Hex is not valid.");
            }
        }
        shellRun(args) {
            if (args.length === 0 || isNaN(parseInt(args[0]))) {
                _StdOut.putText("Invalid command. Usage: run <PID>");
                return;
            }
            let pid = parseInt(args[0]);
            let pcb = _Kernel.getPCB(pid); // Make sure this function works correctly
            if (!pcb) {
                _StdOut.putText(`No process found with PID: ${pid}`);
                return;
            }
            switch (pcb.state) {
                case "Running":
                    _StdOut.putText(`Process ${pid} is already running.`);
                    break;
                case "Terminated":
                    _StdOut.putText(`Process ${pid} is terminated.`);
                    break;
                default:
                    _Scheduler.addProcess(pcb); // Add the process to the scheduler’s ready queue
                    _StdOut.putText(`Starting execution for PID ${pid}`);
                    _StdOut.advanceLine();
                    break;
            }
        }
        shellRunAll(args) {
            _PCBMap.forEach(pcb => {
                _Scheduler.addProcess(pcb); // Add all processes to the scheduler’s ready queue
            });
        }
        shellClearMem(args) {
            if (_CPU.isExecuting) {
                _StdOut.putText("Cannot clear memory while a process is executing.");
            }
            else {
                _MemoryManager.clearAll(); // Clear all memory partitions
                _MemoryManager.unloadProcess(_CPU.currentPCB);
                TSOS.Control.updatePCBs();
                _StdOut.putText("Memory cleared.");
                _StdOut.advanceLine();
            }
        }
        shellPs(args) {
            let activeProcesses = _Scheduler.getActiveProcesses();
            if (activeProcesses.length > 0) {
                activeProcesses.forEach(pcb => _StdOut.putText(`PID: ${pcb.pid}, State: ${pcb.state} \n`));
            }
            else {
                _StdOut.putText("No active processes.");
            }
        }
        shellKill(args) {
            let pid = parseInt(args[0]);
            if (!isNaN(pid)) {
                let pcb = _Kernel.getPCB(pid);
                if (pcb) {
                    if (pcb.state !== "Terminated") {
                        _MemoryManager.unloadProcess(pcb); // Free up the memory used by this process
                        _Scheduler.terminateProcess(pid); // Terminate the process
                        TSOS.Control.updatePCBs();
                        _StdOut.putText(`Terminated process with PID: ${pid}`);
                    }
                    else {
                        _StdOut.putText(`Process with PID: ${pid} is already terminated.`);
                    }
                }
                else {
                    _StdOut.putText("Invalid PID. No such process exists.");
                }
            }
            else {
                _StdOut.putText("Invalid PID. Please enter a numeric PID.");
            }
            _StdOut.advanceLine();
        }
        shellKillAll(args) {
            _Scheduler.getActiveProcesses().forEach(pcb => {
                _MemoryManager.unloadProcess(pcb); // Unload each process from memory
            });
            _Scheduler.terminateAllProcesses(); // Terminate all processes
            TSOS.Control.updatePCBs();
            _StdOut.putText("Terminated all processes.");
        }
        shellQuantum(args) {
            if (args.length > 0) {
                const newQuantum = parseInt(args[0]);
                // Check if the input is a valid number
                if (isNaN(newQuantum) || newQuantum <= 0) {
                    _StdOut.putText("Please enter a valid positive integer for the quantum.");
                }
                else {
                    _Scheduler.setQuantum(newQuantum);
                    TSOS.Control.updateQuantumDisplay(newQuantum);
                    _StdOut.putText(`Quantum is now set to ${newQuantum}.`);
                }
            }
            else {
                _StdOut.putText("Please provide a quantum value.");
            }
        }
        shellFormat(args) {
            if (_CPU.isExecuting) {
                _StdOut.putText("Cannot format disk with a running CPU");
            }
            else {
                _krnKeyboardDisk.format();
                _IsDiskFormatted = true;
                _StdOut.putText("Death Star Disk format complete. The force is strong with this one");
            }
        }
        shellCreate(args) {
            if (_IsDiskFormatted === false) {
                _StdOut.putText("Please format the disk first by entering 'format'");
            }
            else if (args.length === 0) {
                _StdOut.putText("Usage: create <filename> - Please provide a filename.");
            }
            else if (args[0].charAt(0) === '.') {
                _StdOut.putText("User created files starting with '.' is illegal");
            }
            else {
                // Pass the filename to the createFile method of t
                let success = _krnKeyboardDisk.createFile(args[0]);
                if (success) {
                    _StdOut.putText(`File '${args[0]}' created successfully.`);
                    TSOS.Control.updateDiskDisplay(); // Update the disk display to show the new file.
                }
                else {
                    _StdOut.putText(`Failed to create file '${args[0]}'.`);
                }
            }
        }
        shellRead(args) {
            if (_IsDiskFormatted === false) {
                _StdOut.putText("Please format the disk first by entering 'format'");
            }
            else if (args.length === 0) {
                _StdOut.putText("Usage: read <filename> - Please provide a filename.");
            }
            else {
                const filename = args[0];
                const dirEntryKey = _krnKeyboardDisk.findDirEntry(filename);
                if (!dirEntryKey) {
                    _StdOut.putText(`File '${filename}' not found.`);
                }
                else {
                    const dataBlockKey = _krnKeyboardDisk.getDataBlockKey(dirEntryKey);
                    if (dataBlockKey) {
                        let fileData = _krnKeyboardDisk.readFileData(dataBlockKey);
                        if (fileData !== null) {
                            _StdOut.putText(`Data from file '${filename}': ${fileData}`);
                        }
                        else {
                            _StdOut.putText(`Error reading the file '${filename}'.`);
                        }
                    }
                    else {
                        _StdOut.putText(`No data block found for file '${filename}'.`);
                    }
                }
            }
        }
        shellWrite(args) {
            //console.log('args:', args);
            if (_IsDiskFormatted === false) {
                _StdOut.putText("Please format the disk first by entering 'format'");
            }
            else if (args.length < 2) {
                _StdOut.putText("Usage: write <filename> \"data\" - Please provide a filename and data enclosed in quotes.");
            }
            else {
                const filename = args[0];
                let data = args.slice(1).join(' ');
                data = data.replace(/[\u0000-\u001F\u007F-\u009F\u0010]+/g, ''); // Remove control characters
                //console.log(`just data ${data}`);
                if (!(data.startsWith('"') && data.endsWith('"'))) {
                    _StdOut.putText("Please enclose the data in quotes.");
                }
                else {
                    data = data.substring(1, data.length - 1); // Remove the surrounding quotes from the data
                    //console.log(`data after removed quotes: ${data}`);
                    // Find the directory entry for the file
                    const dirEntryKey = _krnKeyboardDisk.findDirEntry(filename);
                    if (dirEntryKey) {
                        // Get the key for the data block from the directory entry
                        const dataBlockKey = _krnKeyboardDisk.getDataBlockKey(dirEntryKey);
                        if (dataBlockKey) {
                            if (_krnKeyboardDisk.writeFile(filename, data, dataBlockKey)) {
                                _Kernel.krnTrace(`File '${filename}' written successfully.`);
                                _StdOut.putText(`File '${filename}' written successfully.`);
                                TSOS.Control.updateDiskDisplay();
                            }
                            else {
                                _StdOut.putText(`Error writing to file '${filename}'.`);
                            }
                        }
                        else {
                            _StdOut.putText(`No data block found for file '${filename}'.`);
                        }
                    }
                    else {
                        _StdOut.putText(`File '${filename}' not found.`);
                    }
                }
            }
        }
        shellDelete(args) {
            if (_IsDiskFormatted === false) {
                _StdOut.putText("Please format the disk first by entering 'format'");
                return;
            }
            if (args.length < 1) {
                _StdOut.putText("Usage: delete <filename> - This will delete the specific disk file");
                return;
            }
            const filename = args[0];
            const deletionSuccess = _krnKeyboardDisk.deleteFile(filename);
            if (deletionSuccess) {
                _StdOut.putText(`File '${filename}' deleted successfully.`);
                TSOS.Control.updateDiskDisplay(); // Refresh the disk display.
            }
            else {
                _StdOut.putText(`Failed to delete file '${filename}'.`);
            }
        }
        shellCopy(args) {
            if (_IsDiskFormatted === false) {
                _StdOut.putText("Please format the disk first by entering 'format'");
            }
            else if (args.length < 2) {
                _StdOut.putText("Usage: copy <existing filename> <new filename> - to copy a file on the disk.");
            }
            else {
                const existingFilename = args[0];
                const newFilename = args[1];
                // Call the copyFile method which does the actual copying
                const success = _krnKeyboardDisk.copyFile(existingFilename, newFilename);
                if (success) {
                    _StdOut.putText(`File '${existingFilename}' copied to '${newFilename}' successfully.`);
                    TSOS.Control.updateDiskDisplay(); // Refresh the disk display
                }
                else {
                    _StdOut.putText(`Failed to copy file '${existingFilename}'.`);
                }
            }
        }
        shellRename(args) {
            if (_IsDiskFormatted === false) {
                _StdOut.putText("Please format the disk first by entering 'format'");
            }
            else if (args.length < 2) {
                _StdOut.putText("Usage: rename <existing filename> <new filename> - to rename a file on the disk.");
            }
            else {
                const existingFilename = args[0];
                const newFilename = args[1];
                // Call the renameFile method which does the actual renaming
                const success = _krnKeyboardDisk.renameFile(existingFilename, newFilename);
                if (success) {
                    _StdOut.putText(`File renamed from '${existingFilename}' to '${newFilename}' successfully.`);
                    TSOS.Control.updateDiskDisplay(); // Refresh the disk display
                }
            }
        }
        shellLs(args) {
            if (_IsDiskFormatted === false) {
                _StdOut.putText("Please format the disk first by entering 'format'");
                return;
            }
            const fileList = _krnKeyboardDisk.listAllFiles();
            if (fileList.length === 0) {
                _StdOut.putText("No files found on the disk.");
            }
            else {
                for (const file of fileList) {
                    _StdOut.putText(file + " ");
                }
            }
        }
    }
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shell.js.map