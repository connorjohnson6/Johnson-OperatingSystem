/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    
    let _Memory = new TSOS.Memory();
    let _MemoryAccessor = new TSOS.MemoryAccessor(_Memory);

    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc: ShellCommand;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            //date
            sc = new ShellCommand(this.shellDate,
                                 "date",
                                 "- Displays the current date.");
            this.commandList[this.commandList.length] = sc;


            //whereami
            sc = new ShellCommand(this.shellWhereami,
                                  "whereami",
                                  "- Displays the current whereami");
            this.commandList[this.commandList.length] = sc;

            //temp
            sc = new ShellCommand(this.shellGame,
                                "game",
                                "- Roll my dice :)");
            this.commandList[this.commandList.length] = sc;

            //status
            sc = new ShellCommand(this.shellStatus,
                                  "status",
                                  "- Status <string>");
            this.commandList[this.commandList.length] = sc;

            //BSOD
            sc = new ShellCommand(this.shellBSOD,
                                "bsod",
                                "- Displays when OS error occurred");
            this.commandList[this.commandList.length] = sc;

            //load
            sc = new ShellCommand(this.shellLoad,
                                "load",
                                "- See if your hex log is valid");
            this.commandList[this.commandList.length] = sc;


            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
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
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);  // Note that args is always supplied, though it might be empty.
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
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

        public parseInput(buffer: string): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
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
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.

        public shellVer(args: string[]) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args: string[]) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args: string[]) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }

        public shellCls(args: string[]) {         
            _StdOut.clearScreen();     
            _StdOut.resetXY();
        }


        //make more descriptions for the user
        public shellMan(args: string[]) {
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
                         _StdOut.putText("Check to see if your hex log is valid");
                        break;

                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args: string[]) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
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
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args: string[]) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args: string[]) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate(args: string[]) {

            //suprisingly, google's AI actually helped me with this when I was looking up the date function

            const today = new Date();

            const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
            const dateTime = date + ' ' + time;
            _StdOut.putText(dateTime); 

        }

        public shellWhereami(args: string[]) {

   
            _StdOut.putText('In a galaxy... far far away...');
            //I want to see if I can use the api to actually track IP addresses
            //https://ipapi.medium.com/ip-address-location-javascript-examples-82dd5d6da9cb

        }

        public shellGame(args: string[]) {
            let min = 1;
            let max = 12;
        
            // Generate a random number between min and max
            let userRoll = Math.floor(Math.random() * (max - min + 1)) + min;
            let computerRoll = Math.floor(Math.random() * (max - min + 1)) + min;
        
            if (userRoll > computerRoll) {
                _StdOut.putText("You rolled a " + userRoll.toString() +  " you beat me :(");
            }
            else if (userRoll < computerRoll) {
                _StdOut.putText("You rolled a " + userRoll.toString() + " but I beat you this time ;)");
            }
            else {
                _StdOut.putText("Well, I guess we are equally good at this game");
            }
            
        }
        public shellStatus(args: string[]) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
        
                // Get the HTML element with the id "statusContainer"
                const statusContainer = document.getElementById("statusContainer");
        
                // Check if the element exists before updating its content
                if (statusContainer) {
                    // Create an <p> element
                    const pElement = document.createElement("p");
                    
                    // Set the text content of the <p> element to the status text
                    pElement.textContent = _OsShell.promptStr;
                    
                    // Clear the previous content of the statusContainer
                    statusContainer.innerHTML = "";
                    
                    // Append the <p> element to the statusContainer
                    statusContainer.appendChild(pElement);
                }
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellBSOD(args: string[]) {
            //this message isnt actually going to be displaying anything, you'll see
            Kernel.krnTrapError("test");
            
            
        }
        
        public shellLoad(args: string[]): void {
            
            //https://www.tutorialspoint.com/access-an-element-in-type-script#:~:text=Using%20getElementById()%20method,a%20form%20of%20an%20object.
            let taProgramInput = (<HTMLTextAreaElement>document.getElementById("taProgramInput")).value;

            let hexValidate = /^[0-9A-Fa-f\s]*$/;

            if(hexValidate.test(taProgramInput)){
                _StdOut.putText("Hex is valid. Loading into memory...");
                _StdOut.advanceLine();

                // Split the input by spaces to get individual op codes
                let opCodes = taProgramInput.split(/\s+/);

                // Load the op codes into memory
                for (let i = 0; i < opCodes.length; i++) {
                    _MemoryAccessor.write(i, parseInt(opCodes[i], 16));
                }

                _StdOut.putText("Op codes loaded into memory.");
            } else {
                _StdOut.putText("Hex is not valid.");
            }
        }

        public shellRun(args: string[]): void {
            if (_CPU.isExecuting) {
                _StdOut.putText("CPU is already executing a program.");
                return;
            }

            _StdOut.putText("Starting program execution...");
            _StdOut.advanceLine();

            // Reset the CPU properties
            _CPU.init();

            // Start the CPU execution
            _CPU.isExecuting = true;
        }
        
  
        
        
    }
}