/**
 * ========================================================================
 * GAMEPAD TESTER - MAIN APPLICATION
 * Orchestrates all modules and handles the core application logic
 * ========================================================================
 */

class GamepadTesterApp {
    constructor() {
        // Modules
        this.gamepadManager = null;
        this.controllerRenderer = null;
        this.uiManager = null;

        // State
        this.isInitialized = false;

        // Initialize
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Create instances of modules
            this.gamepadManager = new GamepadManager();
            this.controllerRenderer = new ControllerRenderer('svgContainer');
            this.uiManager = new UIManager();

            // Expose gamepad manager globally for UI access
            window.gamepadManager = this.gamepadManager;

            // Attach event handlers
            this.attachHandlers();

            this.isInitialized = true;
            console.log('✓ Gamepad Tester initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Gamepad Tester:', error);
        }
    }

    /**
     * Attach event handlers from gamepad manager
     */
    attachHandlers() {
        // Connection handler
        this.gamepadManager.onConnect((event) => {
            console.log('✓ Gamepad connected:', event.id);
            this.handleGamepadConnected(event);
        });

        // Disconnection handler
        this.gamepadManager.onDisconnect((event) => {
            console.log('✓ Gamepad disconnected, index:', event.index);
            this.handleGamepadDisconnected(event);
        });

        // Update handler - called continuously
        this.gamepadManager.onUpdate((state) => {
            this.handleGamepadUpdate(state);
        });

        // Button press handler
        this.gamepadManager.onButtonPress((event) => {
            this.handleButtonPress(event);
        });

        // Button release handler
        this.gamepadManager.onButtonRelease((event) => {
            this.handleButtonRelease(event);
        });

        // Axis change handler
        this.gamepadManager.onAxisChange((event) => {
            this.handleAxisChange(event);
        });
    }

    /**
     * Handle gamepad connection
     */
    handleGamepadConnected(event) {
        // Update UI to show connected state
        const activeGamepad = this.gamepadManager.getActiveGamepad();
        if (activeGamepad) {
            const state = this.gamepadManager.getGamepadState(activeGamepad);
            this.uiManager.showConnectedState(state);
        }
    }

    /**
     * Handle gamepad disconnection
     */
    handleGamepadDisconnected(event) {
        // If no more gamepads, show disconnected state
        if (!this.gamepadManager.isConnected()) {
            this.uiManager.showDisconnectedState();
            this.controllerRenderer.reset();
        }
    }

    /**
     * Handle continuous gamepad updates
     */
    handleGamepadUpdate(state) {
        // Update all displays
        this.uiManager.updateFullDisplay(state);
    }

    /**
     * Handle button press event
     */
    handleButtonPress(event) {
        // Visual feedback on UI
        this.uiManager.updateButtonPress(event.index, true, event.button);

        // Visual feedback on SVG controller
        if (this.controllerRenderer) {
            this.controllerRenderer.updateButtonPress(event.index, true, event.button);
        }

        // Trigger subtle haptic feedback if supported
        this.playButtonPressTactileFeedback(event.index);

        // Log for debugging
        if (process.env.NODE_ENV === 'development') {
            console.debug(`Button pressed: ${event.button} (index: ${event.index})`);
        }
    }

    /**
     * Handle button release event
     */
    handleButtonRelease(event) {
        // Remove visual feedback
        this.uiManager.updateButtonPress(event.index, false, event.button);

        // Visual feedback on SVG controller
        if (this.controllerRenderer) {
            this.controllerRenderer.updateButtonPress(event.index, false, event.button);
        }
    }

    /**
     * Handle axis change event
     */
    handleAxisChange(event) {
        // Update axis display in UI
        this.uiManager.updateAxisDisplay(event.index, event.value, event.name);

        // Update SVG controller visualization
        if (this.controllerRenderer) {
            // Map axes to stick positions
            if (event.index === 0 || event.index === 1) {
                // Left stick
                const xAxis = this.gamepadManager.axisStates.get(
                    this.gamepadManager.activeGamepad
                )?.[0] || 0;
                const yAxis = this.gamepadManager.axisStates.get(
                    this.gamepadManager.activeGamepad
                )?.[1] || 0;

                this.controllerRenderer.updateStickPosition('left', xAxis, yAxis);
            } else if (event.index === 2 || event.index === 3) {
                // Right stick
                const xAxis = this.gamepadManager.axisStates.get(
                    this.gamepadManager.activeGamepad
                )?.[2] || 0;
                const yAxis = this.gamepadManager.axisStates.get(
                    this.gamepadManager.activeGamepad
                )?.[3] || 0;

                this.controllerRenderer.updateStickPosition('right', xAxis, yAxis);
            } else if (event.index === 4 || event.index === 5) {
                // Triggers
                this.controllerRenderer.updateAxisValue(event.index, event.value, event.name);
            }
        }
    }

    /**
     * Play tactile feedback for button press (using Gamepad Haptics API)
     */
    playButtonPressTactileFeedback(buttonIndex) {
        // Optional: trigger very light vibration on button press
        // Commented out as it might be too much feedback
        // this.gamepadManager.testVibration('light');
    }

    /**
     * Get application status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            gamepadConnected: this.gamepadManager.isConnected(),
            activeGamepadIndex: this.gamepadManager.activeGamepad,
            connectedGamepadCount: this.gamepadManager.getGamepadCount(),
        };
    }
}

// ========================================================================
// APPLICATION BOOTSTRAP
// ========================================================================

// Create application instance when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new GamepadTesterApp();
    });
} else {
    window.app = new GamepadTesterApp();
}

// Log app info
console.log('Gamepad Tester v1.0.0');
console.log('Browser Gamepad API support:', 'getGamepads' in navigator ? '✓ Yes' : '✗ No');

// Check vibration support safely
try {
    const hasVibration = typeof GamepadButton !== 'undefined' && 'vibrationActuator' in GamepadButton.prototype;
    console.log('Vibration API support:', hasVibration ? '✓ Yes' : '✗ No');
} catch (e) {
    console.log('Vibration API support: ✗ No or unavailable');
}

// ========================================================================
// ERROR HANDLING
// ========================================================================

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
