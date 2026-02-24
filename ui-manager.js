/**
 * ========================================================================
 * UI MANAGER MODULE
 * Manages all UI updates, element rendering, and user interactions
 * ========================================================================
 */

class UIManager {
    constructor() {
        // DOM elements
        this.elements = {
            statusIndicator: document.getElementById('statusIndicator'),
            statusText: document.getElementById('statusText'),
            statusDot: document.querySelector('.status-dot'),
            statusContent: document.getElementById('statusContent'),
            infoSection: document.getElementById('infoSection'),
            controllerSection: document.getElementById('controllerSection'),
            buttonsSection: document.getElementById('buttonsSection'),
            axesSection: document.getElementById('axesSection'),
            vibrationSection: document.getElementById('vibrationSection'),
            controllerName: document.getElementById('controllerName'),
            controllerIndex: document.getElementById('controllerIndex'),
            buttonCount: document.getElementById('buttonCount'),
            axesCount: document.getElementById('axesCount'),
            buttonsGrid: document.getElementById('buttonsGrid'),
            axesGrid: document.getElementById('axesGrid'),
            vibrateLightBtn: document.getElementById('vibrateLightBtn'),
            vibrateMediumBtn: document.getElementById('vibrateMediumBtn'),
            vibrateStrongBtn: document.getElementById('vibrateStrongBtn'),
            vibrationStatus: document.getElementById('vibrationStatus'),
        };

        // State
        this.currentGamepadState = null;
        this.buttonHoldTimers = new Map();

        this.init();
    }

    /**
     * Initialize UI manager and event listeners
     */
    init() {
        this.attachEventListeners();
        this.showDisconnectedState();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        this.elements.vibrateLightBtn.addEventListener('click', () => {
            this.triggerVibration('light');
        });

        this.elements.vibrateMediumBtn.addEventListener('click', () => {
            this.triggerVibration('medium');
        });

        this.elements.vibrateStrongBtn.addEventListener('click', () => {
            this.triggerVibration('strong');
        });
    }

    /**
     * Show disconnected state
     */
    showDisconnectedState() {
        this.elements.statusDot.classList.remove('connected');
        this.elements.statusText.textContent = 'No Controller Connected';
        this.elements.statusContent.innerHTML =
            '<p class="no-controller-message">Connect a gamepad to get started. Your device will be automatically detected.</p>';

        // Hide sections
        this.elements.infoSection.style.display = 'none';
        this.elements.controllerSection.style.display = 'none';
        this.elements.buttonsSection.style.display = 'none';
        this.elements.axesSection.style.display = 'none';
        this.elements.vibrationSection.style.display = 'none';
    }

    /**
     * Show connected state
     */
    showConnectedState(gamepadState) {
        this.currentGamepadState = gamepadState;

        this.elements.statusDot.classList.add('connected');
        this.elements.statusText.textContent = `Connected: ${gamepadState.id}`;
        this.elements.statusContent.innerHTML = `
            <div style="padding: 1rem 0;">
                <p style="color: var(--color-text-secondary); margin-bottom: 0.5rem;">
                    Ready for testing. Press buttons and move sticks to see live feedback.
                </p>
                <p style="font-size: 0.85rem; color: var(--color-text-tertiary);">
                    Vibration: ${gamepadState.vibration.supported ? 'Supported' : 'Not supported'}
                </p>
            </div>
        `;

        // Update controller info
        this.updateControllerInfo(gamepadState);

        // Show sections
        this.elements.infoSection.style.display = 'block';
        this.elements.controllerSection.style.display = 'block';
        this.elements.buttonsSection.style.display = 'block';
        this.elements.axesSection.style.display = 'block';

        if (gamepadState.vibration.supported) {
            this.elements.vibrationSection.style.display = 'block';
        }

        // Render buttons and axes
        this.renderButtonsGrid(gamepadState);
        this.renderAxesGrid(gamepadState);
    }

    /**
     * Update controller information
     */
    updateControllerInfo(gamepadState) {
        this.elements.controllerName.textContent = gamepadState.id;
        this.elements.controllerIndex.textContent = gamepadState.index;
        this.elements.buttonCount.textContent = gamepadState.buttons.length;
        this.elements.axesCount.textContent = gamepadState.axes.length;
    }

    /**
     * Render buttons grid
     */
    renderButtonsGrid(gamepadState) {
        this.elements.buttonsGrid.innerHTML = '';

        gamepadState.buttons.forEach((button, index) => {
            const div = document.createElement('div');
            div.className = 'button-item';
            div.setAttribute('data-button-index', index);
            div.setAttribute('role', 'status');
            div.setAttribute('aria-label', `${button.name} button, current state: ${button.pressed ? 'pressed' : 'released'}`);

            const indexSpan = document.createElement('span');
            indexSpan.className = 'button-index';
            indexSpan.textContent = `[${index}]`;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'button-name';
            nameSpan.textContent = button.name;

            div.appendChild(indexSpan);
            div.appendChild(nameSpan);
            this.elements.buttonsGrid.appendChild(div);
        });
    }

    /**
     * Render axes grid
     */
    renderAxesGrid(gamepadState) {
        this.elements.axesGrid.innerHTML = '';

        gamepadState.axes.forEach((axis, index) => {
            const card = document.createElement('div');
            card.className = 'axis-card';
            card.setAttribute('data-axis-index', index);
            card.setAttribute('role', 'status');
            card.setAttribute('aria-label', `${axis.name} axis, current value: ${axis.value.toFixed(3)}`);

            const label = document.createElement('div');
            label.className = 'axis-label';
            label.textContent = axis.name;

            const bar = document.createElement('div');
            bar.className = 'axis-bar';
            bar.setAttribute('role', 'progressbar');
            bar.setAttribute('aria-valuenow', (axis.value * 100).toFixed(0));
            bar.setAttribute('aria-valuemin', '-100');
            bar.setAttribute('aria-valuemax', '100');

            const fill = document.createElement('div');
            fill.className = 'axis-fill';
            fill.style.width =
                axis.value >= 0
                    ? `${50 + (axis.value * 50).toFixed(0)}%`
                    : `${50 + (axis.value * 50).toFixed(0)}%`;
            bar.appendChild(fill);

            const value = document.createElement('div');
            value.className = 'axis-value';
            value.textContent = axis.value.toFixed(3);

            card.appendChild(label);
            card.appendChild(bar);
            card.appendChild(value);
            this.elements.axesGrid.appendChild(card);
        });
    }

    /**
     * Update button UI on press
     */
    updateButtonPress(buttonIndex, isPressed, buttonName) {
        const buttonElement = this.elements.buttonsGrid.querySelector(
            `[data-button-index="${buttonIndex}"]`
        );

        if (buttonElement) {
            if (isPressed) {
                buttonElement.classList.add('pressed');

                // Determine color based on button type
                let colorClass = '';
                if (buttonIndex >= 0 && buttonIndex <= 3) {
                    // Action buttons get alternating accent
                    if (buttonIndex === 0) colorClass = 'pressed'; // Green for A
                    else colorClass = 'pressed';
                } else if (buttonIndex >= 4 && buttonIndex <= 7) {
                    colorClass = 'pressed'; // Shoulder buttons
                } else {
                    colorClass = 'pressed neon'; // Center buttons with neon
                }

                buttonElement.classList.add(colorClass);

                // Clear existing timer if any
                if (this.buttonHoldTimers.has(buttonIndex)) {
                    clearTimeout(this.buttonHoldTimers.get(buttonIndex));
                }

                // Vibrate effect (small scale animation)
                this.playButtonPressFeedback(buttonElement);
            } else {
                buttonElement.classList.remove('pressed', 'neon');
                if (this.buttonHoldTimers.has(buttonIndex)) {
                    clearTimeout(this.buttonHoldTimers.get(buttonIndex));
                    this.buttonHoldTimers.delete(buttonIndex);
                }
            }
        }
    }

    /**
     * Play button press feedback animation
     */
    playButtonPressFeedback(element) {
        // Add animation class
        element.style.animation = 'none';
        setTimeout(() => {
            element.style.animation = '';
        }, 50);
    }

    /**
     * Update axis display
     */
    updateAxisDisplay(axisIndex, value, axisName) {
        const axisCard = this.elements.axesGrid.querySelector(`[data-axis-index="${axisIndex}"]`);

        if (axisCard) {
            const valueDisplay = axisCard.querySelector('.axis-value');
            const bar = axisCard.querySelector('.axis-bar');
            const fill = axisCard.querySelector('.axis-fill');

            if (valueDisplay) {
                valueDisplay.textContent = value.toFixed(3);
            }

            if (bar) {
                bar.setAttribute('aria-valuenow', (value * 100).toFixed(0));
            }

            if (fill) {
                const percentage =
                    value >= 0
                        ? `${50 + (value * 50).toFixed(0)}%`
                        : `${50 + (value * 50).toFixed(0)}%`;
                fill.style.width = percentage;
            }
        }
    }

    /**
     * Trigger vibration
     */
    async triggerVibration(pattern) {
        const statusEl = this.elements.vibrationStatus;
        statusEl.className = 'vibration-status';
        statusEl.textContent = `Testing ${pattern} vibration...`;

        try {
            // This will be called from app.js with the actual implementation
            const result = await window.gamepadManager.testVibration(pattern);

            if (result) {
                statusEl.className = 'vibration-status success';
                statusEl.textContent = `✓ ${pattern.charAt(0).toUpperCase() + pattern.slice(1)} vibration successful!`;

                setTimeout(() => {
                    statusEl.className = 'vibration-status';
                    statusEl.textContent = 'Ready to test';
                }, 2000);
            } else {
                statusEl.className = 'vibration-status';
                statusEl.textContent = 'Vibration not supported';

                setTimeout(() => {
                    statusEl.textContent = 'Ready to test';
                }, 2000);
            }
        } catch (error) {
            statusEl.textContent = 'Vibration test failed';
            console.error('Vibration error:', error);

            setTimeout(() => {
                statusEl.textContent = 'Ready to test';
            }, 2000);
        }
    }

    /**
     * Update all displays on gamepad state change
     */
    updateFullDisplay(gamepadState) {
        this.currentGamepadState = gamepadState;
        this.updateControllerInfo(gamepadState);
        this.renderButtonsGrid(gamepadState);
        this.renderAxesGrid(gamepadState);
    }

    /**
     * Get UI elements (for external access)
     */
    getElements() {
        return this.elements;
    }
}

// Export for use
window.UIManager = UIManager;
