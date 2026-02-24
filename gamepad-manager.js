/**
 * ========================================================================
 * GAMEPAD MANAGER MODULE
 * Handles all Gamepad API interactions including detection, monitoring,
 * and real-time data capture
 * ========================================================================
 */

class GamepadManager {
    constructor() {
        // State management
        this.gamepads = new Map();
        this.activeGamepad = null;
        this.isRunning = false;
        this.rafId = null;

        // Constants
        this.STICK_DEAD_ZONE = 0.15;
        this.TRIGGER_DEAD_ZONE = 0.05;

        // Callback registry
        this.callbacks = {
            onConnect: null,
            onDisconnect: null,
            onUpdate: null,
            onButtonPress: null,
            onButtonRelease: null,
            onAxisChange: null,
        };

        // Button state tracking for press detect
        this.buttonStates = new Map();
        this.axisStates = new Map();

        this.init();
    }

    /**
     * Initialize gamepad manager and attach event listeners
     */
    init() {
        // Attach button event listeners if supported
        window.addEventListener('gamepadconnected', (e) => this.handleGamepadConnected(e));
        window.addEventListener('gamepaddisconnected', (e) => this.handleGamepadDisconnected(e));

        // Start monitoring loop
        this.start();
    }

    /**
     * Handle gamepad connected event
     */
    handleGamepadConnected(event) {
        const gamepad = event.gamepad;
        this.gamepads.set(gamepad.index, gamepad);

        // Set as active if this is the first controller
        if (!this.activeGamepad) {
            this.activeGamepad = gamepad.index;
        }

        this.initializeButtonStates(gamepad.index, gamepad);
        this.initializeAxisStates(gamepad.index, gamepad);

        if (this.callbacks.onConnect) {
            this.callbacks.onConnect({
                index: gamepad.index,
                id: gamepad.id,
                buttons: gamepad.buttons.length,
                axes: gamepad.axes.length,
                timestamp: gamepad.timestamp,
            });
        }
    }

    /**
     * Handle gamepad disconnected event
     */
    handleGamepadDisconnected(event) {
        const index = event.gamepad.index;
        this.gamepads.delete(index);
        this.buttonStates.delete(index);
        this.axisStates.delete(index);

        // Switch to another active gamepad if available
        if (this.activeGamepad === index) {
            this.activeGamepad = this.gamepads.size > 0 ? [...this.gamepads.keys()][0] : null;
        }

        if (this.callbacks.onDisconnect) {
            this.callbacks.onDisconnect({
                index: index,
                timestamp: event.gamepad.timestamp,
            });
        }
    }

    /**
     * Initialize button state tracking
     */
    initializeButtonStates(index, gamepad) {
        if (!this.buttonStates.has(index)) {
            this.buttonStates.set(index, []);
        }

        const states = [];
        for (let i = 0; i < gamepad.buttons.length; i++) {
            states[i] = {
                pressed: false,
                value: 0,
            };
        }
        this.buttonStates.set(index, states);
    }

    /**
     * Initialize axis state tracking
     */
    initializeAxisStates(index, gamepad) {
        if (!this.axisStates.has(index)) {
            this.axisStates.set(index, []);
        }

        const states = [];
        for (let i = 0; i < gamepad.axes.length; i++) {
            states[i] = 0;
        }
        this.axisStates.set(index, states);
    }

    /**
     * Start the continuous monitoring loop
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.poll();
    }

    /**
     * Stop the monitoring loop
     */
    stop() {
        this.isRunning = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    /**
     * Poll gamepads and detect changes
     */
    poll() {
        if (!this.isRunning) return;

        // Get fresh gamepad data
        const gamepads = navigator.getGamepads();

        if (gamepads.length > 0) {
            for (let i = 0; i < gamepads.length; i++) {
                const gamepad = gamepads[i];

                if (gamepad) {
                    // Update or register gamepad
                    if (!this.gamepads.has(i)) {
                        // Auto-detect connection if not fired
                        this.handleGamepadConnected({ gamepad });
                    }

                    // Process input
                    this.processGamepadInput(i, gamepad);

                    // Send update callback
                    if (i === this.activeGamepad && this.callbacks.onUpdate) {
                        this.callbacks.onUpdate(this.getGamepadState(gamepad));
                    }
                }
            }
        }

        this.rafId = requestAnimationFrame(() => this.poll());
    }

    /**
     * Process gamepad input changes (buttons, axes, triggers)
     */
    processGamepadInput(index, gamepad) {
        // Process buttons
        const prevButtonStates = this.buttonStates.get(index) || [];
        for (let i = 0; i < gamepad.buttons.length; i++) {
            const button = gamepad.buttons[i];
            const prevState = prevButtonStates[i] || { pressed: false, value: 0 };

            const isPressed = button.pressed;
            const value = button.value;

            // Detect press
            if (isPressed && !prevState.pressed) {
                if (this.callbacks.onButtonPress) {
                    this.callbacks.onButtonPress({
                        index: i,
                        button: this.getButtonName(index, i),
                        value: value,
                        timestamp: gamepad.timestamp,
                    });
                }
            }

            // Detect release
            if (!isPressed && prevState.pressed) {
                if (this.callbacks.onButtonRelease) {
                    this.callbacks.onButtonRelease({
                        index: i,
                        button: this.getButtonName(index, i),
                        timestamp: gamepad.timestamp,
                    });
                }
            }

            // Update state
            if (!prevButtonStates[i]) {
                prevButtonStates[i] = {};
            }
            prevButtonStates[i].pressed = isPressed;
            prevButtonStates[i].value = value;
        }
        this.buttonStates.set(index, prevButtonStates);

        // Process axes
        const prevAxisStates = this.axisStates.get(index) || [];
        for (let i = 0; i < gamepad.axes.length; i++) {
            const value = gamepad.axes[i];
            const prevValue = prevAxisStates[i] || 0;

            // Apply dead zone
            const adjustedValue = Math.abs(value) > this.STICK_DEAD_ZONE ? value : 0;
            const adjustedPrevValue = Math.abs(prevValue) > this.STICK_DEAD_ZONE ? prevValue : 0;

            // Detect significant change
            if (Math.abs(adjustedValue - adjustedPrevValue) > 0.02) {
                if (this.callbacks.onAxisChange) {
                    this.callbacks.onAxisChange({
                        index: i,
                        value: adjustedValue,
                        rawValue: value,
                        name: this.getAxisName(index, i),
                        timestamp: gamepad.timestamp,
                    });
                }
            }

            prevAxisStates[i] = value;
        }
        this.axisStates.set(index, prevAxisStates);
    }

    /**
     * Get standardized gamepad state snapshot
     */
    getGamepadState(gamepad) {
        return {
            index: gamepad.index,
            id: gamepad.id,
            timestamp: gamepad.timestamp,
            connected: gamepad.connected,
            buttons: gamepad.buttons.map((btn, i) => ({
                index: i,
                name: this.getButtonName(gamepad.index, i),
                pressed: btn.pressed,
                value: btn.value,
            })),
            axes: gamepad.axes.map((axis, i) => ({
                index: i,
                name: this.getAxisName(gamepad.index, i),
                value: Math.abs(axis) > this.STICK_DEAD_ZONE ? axis : 0,
                rawValue: axis,
            })),
            vibration: gamepad.vibrationActuator
                ? {
                      supported: true,
                      type: gamepad.vibrationActuator.type,
                  }
                : { supported: false },
        };
    }

    /**
     * Get standardized button name
     */
    getButtonName(gamepadIndex, buttonIndex) {
        const standardMapping = {
            0: 'A',
            1: 'B',
            2: 'X',
            3: 'Y',
            4: 'LB',
            5: 'RB',
            6: 'LT',
            7: 'RT',
            8: 'Back',
            9: 'Start',
            10: 'LS',
            11: 'RS',
            12: 'Guide',
            13: 'Share',
            14: 'Touchpad',
        };

        return standardMapping[buttonIndex] || `Btn ${buttonIndex}`;
    }

    /**
     * Get standardized axis name
     */
    getAxisName(gamepadIndex, axisIndex) {
        const standardMapping = {
            0: 'LS-X',
            1: 'LS-Y',
            2: 'RS-X',
            3: 'RS-Y',
            4: 'LT',
            5: 'RT',
        };

        return standardMapping[axisIndex] || `Axis ${axisIndex}`;
    }

    /**
     * Test vibration
     */
    async testVibration(pattern = 'medium') {
        if (!this.activeGamepad) return false;

        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[this.activeGamepad];

        if (!gamepad || !gamepad.vibrationActuator) return false;

        const patterns = {
            light: {
                strongMagnitude: 0.3,
                weakMagnitude: 0.2,
                duration: 100,
            },
            medium: {
                strongMagnitude: 0.6,
                weakMagnitude: 0.4,
                duration: 200,
            },
            strong: {
                strongMagnitude: 1.0,
                weakMagnitude: 0.8,
                duration: 300,
            },
        };

        const p = patterns[pattern] || patterns.medium;

        try {
            await gamepad.vibrationActuator.playEffect('dual-rumble', {
                startDelay: 0,
                duration: p.duration,
                strongMagnitude: p.strongMagnitude,
                weakMagnitude: p.weakMagnitude,
            });
            return true;
        } catch (error) {
            console.error('Vibration error:', error);
            return false;
        }
    }

    /**
     * Register update callback
     */
    onUpdate(callback) {
        this.callbacks.onUpdate = callback;
    }

    /**
     * Register connection callback
     */
    onConnect(callback) {
        this.callbacks.onConnect = callback;
    }

    /**
     * Register disconnection callback
     */
    onDisconnect(callback) {
        this.callbacks.onDisconnect = callback;
    }

    /**
     * Register button press callback
     */
    onButtonPress(callback) {
        this.callbacks.onButtonPress = callback;
    }

    /**
     * Register button release callback
     */
    onButtonRelease(callback) {
        this.callbacks.onButtonRelease = callback;
    }

    /**
     * Register axis change callback
     */
    onAxisChange(callback) {
        this.callbacks.onAxisChange = callback;
    }

    /**
     * Get active gamepad data
     */
    getActiveGamepad() {
        if (!this.activeGamepad) return null;
        const gamepads = navigator.getGamepads();
        return gamepads[this.activeGamepad];
    }

    /**
     * Get all connected gamepads
     */
    getAllGamepads() {
        return Array.from(this.gamepads.values());
    }

    /**
     * Check if any gamepad is connected
     */
    isConnected() {
        return this.activeGamepad !== null && this.gamepads.size > 0;
    }

    /**
     * Get gamepad count
     */
    getGamepadCount() {
        return this.gamepads.size;
    }
}

// Export for use
window.GamepadManager = GamepadManager;
