/**
 * ========================================================================
 * CONTROLLER RENDERER MODULE
 * Renders an interactive SVG-based controller diagram with real-time updates
 * Buttons glow when pressed, sticks move dynamically, triggers animate
 * ========================================================================
 */

class ControllerRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.svg = null;
        this.controllerGroup = null;
        this.buttonElements = new Map();
        this.stickElements = new Map();
        this.triggerElements = new Map();
        this.axisValues = new Map();

        this.init();
    }

    /**
     * Initialize and create SVG controller diagram
     */
    init() {
        this.createSVG();
        this.drawController();
    }

    /**
     * Create main SVG element
     */
    createSVG() {
        // Clear existing
        this.container.innerHTML = '';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 600 400');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', 'auto');

        this.svg = svg;
        this.container.appendChild(svg);
    }

    /**
     * Draw the controller outline and components
     */
    drawController() {
        // Define and apply styles
        this.applyStyles();

        // Main controller group
        this.controllerGroup = this.createGroup('controller-group');
        this.svg.appendChild(this.controllerGroup);

        // Draw controller body
        this.drawControllerBody();

        // Draw button sections
        this.drawLeftSection();
        this.drawRightSection();
        this.drawCenterSection();

        // Draw shoulder buttons and triggers
        this.drawShoulderButtons();

        // Draw analog sticks
        this.drawAnalogSticks();
    }

    /**
     * Apply SVG styles
     */
    applyStyles() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

        // Define gradients and filters
        const gradientDark = `
            <linearGradient id="controllerGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#0a0a0a;stop-opacity:1" />
            </linearGradient>

            <linearGradient id="goldGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" style="stop-color:#ffd700;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#ffed4e;stop-opacity:0.8" />
            </linearGradient>

            <linearGradient id="neonGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" style="stop-color:#00d9ff;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#00d9ff;stop-opacity:0.8" />
            </linearGradient>

            <radialGradient id="buttonGlowGold" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                <stop offset="70%" style="stop-color:#ffed4e;stop-opacity:0.5" />
                <stop offset="100%" style="stop-color:#ffd700;stop-opacity:0" />
            </radialGradient>

            <radialGradient id="buttonGlowNeon" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#00d9ff;stop-opacity:1" />
                <stop offset="70%" style="stop-color:#00d9ff;stop-opacity:0.5" />
                <stop offset="100%" style="stop-color:#00d9ff;stop-opacity:0" />
            </radialGradient>

            <filter id="shadowGold">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5"/>
                </feComponentTransfer>
            </filter>

            <filter id="shadowNeon">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5"/>
                </feComponentTransfer>
            </filter>

            <style>
                .controller-body { fill: url(#controllerGradient); stroke: #1a1a1a; stroke-width: 2; }
                .button-base { fill: #1a1a1a; stroke: #333; stroke-width: 1.5; }
                .button-pressed { animation: buttonPress 0.2s ease-out; }
                .stick-base { fill: #0a0a0a; stroke: #333; stroke-width: 2; }
                .stick-cap { fill: #1a1a1a; stroke: #ffd700; stroke-width: 2; }
                .stick-pressed { stroke: #00d9ff; }
                .text-label { font-family: 'Inter', sans-serif; font-size: 12px; fill: #999; }
                .text-value { font-family: 'Inter', sans-serif; font-size: 11px; fill: #666; }

                @keyframes buttonPress {
                    0% { transform: scale(1); }
                    50% { transform: scale(0.92); }
                    100% { transform: scale(1); }
                }

                @keyframes stickMove {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
            </style>
        `;

        defs.innerHTML = gradientDark;
        this.svg.insertBefore(defs, this.svg.firstChild);
    }

    /**
     * Draw main controller body
     */
    drawControllerBody() {
        const body = this.createPath(
            'M 150 120 Q 150 80 200 60 L 400 60 Q 450 80 450 120 L 450 300 Q 450 340 400 360 L 200 360 Q 150 340 150 300 Z',
            'controller-body'
        );
        body.setAttribute('class', 'controller-body');
        this.controllerGroup.appendChild(body);
    }

    /**
     * Draw left section (D-Pad + Left Stick)
     */
    drawLeftSection() {
        // D-Pad group
        const dpadGroup = this.createGroup('dpad-group');
        dpadGroup.setAttribute('transform', 'translate(220, 160)');

        // D-Pad background
        const dpadBg = this.createCircle(0, 0, 25, '#0a0a0a', '#333', 2);
        dpadGroup.appendChild(dpadBg);

        // D-Pad buttons
        this.drawDPadButton(dpadGroup, 0, -12, 'up', 'Up');
        this.drawDPadButton(dpadGroup, 12, 0, 'right', 'Right');
        this.drawDPadButton(dpadGroup, 0, 12, 'down', 'Down');
        this.drawDPadButton(dpadGroup, -12, 0, 'left', 'Left');

        this.controllerGroup.appendChild(dpadGroup);

        // Left stick area
        this.drawStick(190, 260, 'left', 'LS');
    }

    /**
     * Draw D-Pad button
     */
    drawDPadButton(group, x, y, name, label) {
        const isVertical = x === 0;
        const rect = this.createRect(
            x - (isVertical ? 5 : 8),
            y - (isVertical ? 8 : 5),
            isVertical ? 10 : 16,
            isVertical ? 16 : 10,
            '#666',
            '#888',
            1
        );

        rect.setAttribute('class', `button-base dpad-button dpad-${name}`);
        rect.setAttribute('data-button-index', `dpad-${name}`);
        this.buttonElements.set(`dpad-${name}`, rect);
        group.appendChild(rect);
    }

    /**
     * Draw right section (Action Buttons)
     */
    drawRightSection() {
        const buttonGroup = this.createGroup('action-buttons-group');
        buttonGroup.setAttribute('transform', 'translate(360, 180)');

        // Button positions: A, B, X, Y
        this.drawActionButton(buttonGroup, 0, 30, 'A', 0, '#00ff88'); // Green
        this.drawActionButton(buttonGroup, 30, 0, 'B', 1, '#ff0055'); // Red
        this.drawActionButton(buttonGroup, -30, 0, 'X', 2, '#0088ff'); // Blue
        this.drawActionButton(buttonGroup, 0, -30, 'Y', 3, '#ffd700'); // Yellow

        this.controllerGroup.appendChild(buttonGroup);
    }

    /**
     * Draw action button (A, B, X, Y)
     */
    drawActionButton(group, x, y, label, index, color) {
        const circle = this.createCircle(x, y, 16, '#1a1a1a', '#333', 2);
        circle.setAttribute('class', `button-base action-button action-${label}`);
        circle.setAttribute('data-button-index', index);
        this.buttonElements.set(index, circle);
        group.appendChild(circle);

        // Label
        const text = this.createText(x, y, label, 'text-label');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', color);
        text.setAttribute('font-weight', 'bold');
        group.appendChild(text);
    }

    /**
     * Draw center section (Start, Select, Mode buttons, touchpad)
     */
    drawCenterSection() {
        // Back button
        const backBtn = this.createRect(240, 120, 40, 15, '#1a1a1a', '#333', 1);
        backBtn.setAttribute('class', 'button-base center-button');
        backBtn.setAttribute('data-button-index', 8);
        this.buttonElements.set(8, backBtn);
        this.controllerGroup.appendChild(backBtn);

        const backLabel = this.createText(260, 127, 'Back', 'text-label');
        backLabel.setAttribute('text-anchor', 'middle');
        backLabel.setAttribute('fill', '#666');
        this.controllerGroup.appendChild(backLabel);

        // Start button
        const startBtn = this.createRect(320, 120, 40, 15, '#1a1a1a', '#333', 1);
        startBtn.setAttribute('class', 'button-base center-button');
        startBtn.setAttribute('data-button-index', 9);
        this.buttonElements.set(9, startBtn);
        this.controllerGroup.appendChild(startBtn);

        const startLabel = this.createText(340, 127, 'Start', 'text-label');
        startLabel.setAttribute('text-anchor', 'middle');
        startLabel.setAttribute('fill', '#666');
        this.controllerGroup.appendChild(startLabel);
    }

    /**
     * Draw shoulder buttons (LB, RB, LT, RT)
     */
    drawShoulderButtons() {
        // LB
        const lbBtn = this.createRect(180, 75, 50, 20, '#1a1a1a', '#333', 2);
        lbBtn.setAttribute('class', 'button-base shoulder-button');
        lbBtn.setAttribute('data-button-index', 4);
        this.buttonElements.set(4, lbBtn);
        this.controllerGroup.appendChild(lbBtn);

        const lbLabel = this.createText(205, 85, 'LB', 'text-label');
        lbLabel.setAttribute('text-anchor', 'middle');
        lbLabel.setAttribute('fill', '#666');
        this.controllerGroup.appendChild(lbLabel);

        // RB
        const rbBtn = this.createRect(370, 75, 50, 20, '#1a1a1a', '#333', 2);
        rbBtn.setAttribute('class', 'button-base shoulder-button');
        rbBtn.setAttribute('data-button-index', 5);
        this.buttonElements.set(5, rbBtn);
        this.controllerGroup.appendChild(rbBtn);

        const rbLabel = this.createText(395, 85, 'RB', 'text-label');
        rbLabel.setAttribute('text-anchor', 'middle');
        rbLabel.setAttribute('fill', '#666');
        this.controllerGroup.appendChild(rbLabel);

        // LT (trigger)
        this.drawTrigger(190, 45, 'LT', 6, 'left');

        // RT (trigger)
        this.drawTrigger(410, 45, 'RT', 7, 'right');
    }

    /**
     * Draw trigger
     */
    drawTrigger(x, y, label, index, side) {
        const path = side === 'left' 
            ? `M ${x} ${y} L ${x + 30} ${y + 15} L ${x + 30} ${y + 35} L ${x} ${y + 20} Z`
            : `M ${x} ${y} L ${x - 30} ${y + 15} L ${x - 30} ${y + 35} L ${x} ${y + 20} Z`;

        const trigger = this.createPath(path, 'button-base trigger-button');
        trigger.setAttribute('data-button-index', index);
        this.triggerElements.set(index, trigger);
        this.controllerGroup.appendChild(trigger);

        const textX = side === 'left' ? x + 12 : x - 12;
        const text = this.createText(textX, y + 18, label, 'text-label');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#666');
        this.controllerGroup.appendChild(text);
    }

    /**
     * Draw analog stick
     */
    drawStick(x, y, position, label) {
        // Stick area background
        const stickArea = this.createCircle(x, y, 35, '#0a0a0a', '#333', 2);
        stickArea.setAttribute('class', 'stick-base');
        this.controllerGroup.appendChild(stickArea);

        // Stick cap (movable part)
        const stickCap = this.createCircle(x, y, 22, '#1a1a1a', '#ffd700', 2);
        stickCap.setAttribute('class', 'stick-cap');
        this.stickElements.set(position, {
            element: stickCap,
            baseX: x,
            baseY: y,
            maxDistance: 25,
        });
        this.controllerGroup.appendChild(stickCap);

        // Label
        const text = this.createText(x, y + 55, label, 'text-label');
        text.setAttribute('text-anchor', 'middle');
        this.controllerGroup.appendChild(text);

        // Store axis mapping
        this.axisValues.set(position, { x: 0, y: 0 });
    }

    /**
     * Update button press state
     */
    updateButtonPress(buttonIndex, isPressed, buttonName) {
        const element = this.buttonElements.get(buttonIndex);
        if (!element) return;

        if (isPressed) {
            element.setAttribute('class', element.getAttribute('class') + ' button-pressed');
            element.setAttribute('fill', '#ffd700');
            element.setAttribute('opacity', '0.8');

            // Add glow effect
            const glowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            glowFilter.setAttribute('cx', element.getAttribute('cx') || element.getAttribute('x'));
            glowFilter.setAttribute('cy', element.getAttribute('cy') || element.getAttribute('y'));
            glowFilter.setAttribute('r', '25');
            glowFilter.setAttribute('fill', 'url(#buttonGlowGold)');
            glowFilter.setAttribute('opacity', '0.6');
            glowFilter.setAttribute('class', 'button-glow-' + buttonIndex);
            this.svg.appendChild(glowFilter);

            setTimeout(() => {
                const existing = this.svg.querySelector('.button-glow-' + buttonIndex);
                if (existing) existing.remove();
            }, 200);
        } else {
            element.setAttribute('class', element.getAttribute('class').replace(' button-pressed', ''));
            element.setAttribute('fill', '#1a1a1a');
            element.setAttribute('opacity', '1');
        }
    }

    /**
     * Update analog stick position
     */
    updateStickPosition(position, xAxis, yAxis) {
        const stick = this.stickElements.get(position);
        if (!stick) return;

        // Calculate new position
        const distance = Math.sqrt(xAxis ** 2 + yAxis ** 2);
        const maxDistance = stick.maxDistance;

        let newX = stick.baseX + xAxis * maxDistance;
        let newY = stick.baseY + yAxis * maxDistance;

        // Clamp to circle
        if (distance > 1) {
            const limitedDistance = Math.min(distance, 1);
            newX = stick.baseX + (xAxis / distance) * limitedDistance * maxDistance;
            newY = stick.baseY + (yAxis / distance) * limitedDistance * maxDistance;
        }

        // Update position with animation
        stick.element.setAttribute('cx', newX);
        stick.element.setAttribute('cy', newY);

        // Update stored values
        if (this.axisValues.has(position)) {
            this.axisValues.get(position).x = xAxis;
            this.axisValues.get(position).y = yAxis;
        }
    }

    /**
     * Update trigger/axis value visualization
     */
    updateAxisValue(axisIndex, value, axisName) {
        // Map axes to triggers or sticks
        if (axisIndex === 4 || axisIndex === 5) {
            // Triggers
            const triggerIndex = axisIndex === 4 ? 6 : 7;
            const trigger = this.triggerElements.get(triggerIndex);
            if (trigger) {
                const intensity = Math.max(0, value);
                trigger.setAttribute('opacity', 0.3 + intensity * 0.7);
                trigger.setAttribute('fill', `rgba(255, 215, 0, ${0.2 + intensity * 0.8})`);
            }
        }
    }

    /**
     * Reset all visual states
     */
    reset() {
        // Reset all buttons
        this.buttonElements.forEach((element) => {
            element.setAttribute('fill', '#1a1a1a');
            element.setAttribute('opacity', '1');
            element.setAttribute('class', element.getAttribute('class').replace(' button-pressed', ''));
        });

        // Reset all sticks
        this.stickElements.forEach((stick) => {
            stick.element.setAttribute('cx', stick.baseX);
            stick.element.setAttribute('cy', stick.baseY);
        });

        // Reset triggers
        this.triggerElements.forEach((element) => {
            element.setAttribute('opacity', '1');
            element.setAttribute('fill', '#1a1a1a');
        });
    }

    /**
     * Utility: Create SVG group
     */
    createGroup(id) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', id);
        return group;
    }

    /**
     * Utility: Create SVG circle
     */
    createCircle(x, y, r, fill, stroke, strokeWidth) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', fill);
        circle.setAttribute('stroke', stroke);
        circle.setAttribute('stroke-width', strokeWidth);
        return circle;
    }

    /**
     * Utility: Create SVG rect
     */
    createRect(x, y, width, height, fill, stroke, strokeWidth) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('fill', fill);
        rect.setAttribute('stroke', stroke);
        rect.setAttribute('stroke-width', strokeWidth);
        return rect;
    }

    /**
     * Utility: Create SVG path
     */
    createPath(d, className) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('class', className);
        return path;
    }

    /**
     * Utility: Create SVG text
     */
    createText(x, y, text, className) {
        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.setAttribute('x', x);
        textEl.setAttribute('y', y);
        textEl.setAttribute('class', className);
        textEl.textContent = text;
        return textEl;
    }
}

// Export for use
window.ControllerRenderer = ControllerRenderer;
