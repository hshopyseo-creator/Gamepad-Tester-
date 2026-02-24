# Gamepad Tester

Premium real-time gamepad detection and testing application built with HTML5, CSS3, and Vanilla JavaScript.

## Features

✨ **Real-time Gamepad Detection**
- Automatic connection/disconnection detection
- Support for multiple controllers
- Live status indicators with animations

🎮 **Interactive Controller Visualization**
- SVG-based controller diagram with real-time feedback
- Buttons glow when pressed
- Analog sticks move dynamically
- Triggers animate based on pressure
- Visual feedback for all inputs

📊 **Comprehensive Input Monitoring**
- Button press detection with visual highlighting
- Analog stick position tracking (live X/Y values)
- Trigger pressure display with bar visualization
- All axes values displayed in real-time
- Dead zone handling for smooth input

🎯 **Vibration Testing**
- Light, medium, and strong vibration patterns
- Real-time vibration feedback (if supported)
- Status messages for each test

🎨 **Premium Design**
- Dark theme with gold and neon blue accents
- Glassmorphism UI elements
- Smooth animations and transitions
- Fully responsive design (mobile, tablet, desktop)
- Professional typography (Poppins + Inter fonts)
- Accessibility support (ARIA labels, keyboard navigation)

## Technology Stack

- **HTML5** - Semantic markup with accessibility support
- **CSS3** - Modern styling with animations, gradients, and glassmorphism
- **Vanilla JavaScript** - No frameworks, pure Gamepad API implementation
- **SVG** - Interactive controller diagram
- **Gamepad API** - Browser-native gamepad detection

## Browser Support

- Chrome 25+
- Firefox 29+
- Edge 12+
- Safari 10.1+
- Opera 15+

## Getting Started

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gamepad-tester.git
cd gamepad-tester
```

2. Open `index.html` in a modern web browser

3. Connect a gamepad/controller to your device

4. The app will automatically detect your controller

### Deployment on Vercel

1. Push this repository to GitHub

2. Import the repository in Vercel:
   - Go to https://vercel.com/new
   - Select your repository
   - Click "Deploy"

3. Your app will be live at a generated Vercel URL

## File Structure

```
gamepad-tester/
├── index.html                 # Main HTML file
├── vercel.json               # Vercel configuration
├── README.md                 # This file
└── assets/
    ├── styles/
    │   └── main.css         # All styling (premium dark theme)
    └── js/
        ├── app.js           # Main application orchestrator
        ├── gamepad-manager.js       # Gamepad API wrapper
        ├── controller-renderer.js    # SVG controller diagram
        └── ui-manager.js            # UI updates and interactions
```

## Module Documentation

### GamepadManager
Handles all Gamepad API interactions:
- Connection/disconnection detection
- Continuous polling via requestAnimationFrame
- Button press/release detection
- Analog stick and trigger tracking
- Vibration testing
- Dead zone handling

### ControllerRenderer
Renders interactive SVG controller diagram:
- Dynamic D-pad buttons
- Action buttons (A, B, X, Y) with color coding
- Analog sticks with real-time position updates
- Shoulder buttons and triggers
- Real-time glow effects

### UIManager
Manages all UI updates:
- Controller info display
- Button grid rendering
- Axes/stick value display
- Vibration testing interface
- Connected/disconnected states

### GamepadTesterApp
Main orchestrator:
- Initializes all modules
- Connects event handlers
- Manages data flow between modules
- Error handling

## Supported Gamepads

- Xbox 360 Controller
- Xbox One Controller
- PlayStation 4 DualShock 4
- PlayStation 5 DualSense
- Joy-Con (Nintendo Switch)
- Generic USB Gamepads
- Most HID-compliant controllers

## Performance Optimizations

- Efficient requestAnimationFrame polling
- Dead zone filtering to reduce noise
- CSS animations for smooth visuals
- Debounced UI updates
- Minimal DOM manipulation
- Optimized SVG rendering
- No external dependencies

## Accessibility

- ARIA labels for all interactive elements
- Semantic HTML structure
- Keyboard navigation support
- High contrast mode support
- Reduced motion preferences respected
- Status updates with aria-live regions

## SEO & Open Graph

- Comprehensive meta tags
- Open Graph support for social sharing
- Twitter Card support
- Structured semantic HTML
- Mobile-friendly viewport settings

## Security

- No external script dependencies
- Content Security Policy compatible
- XSS protection headers
- Safe Gamepad API usage
- No localStorage/tracking

## License

MIT License - Feel free to use this project for personal and educational purposes.

## Support

For issues or questions:
1. Check the browser console for error messages
2. Ensure your gamepad is properly connected
3. Try a different browser if issues persist
4. Test with a known working gamepad if available

## Credits

Built with modern web standards and best practices for premium user experience.

## Changelog

### v1.0.0 (Initial Release)
- Complete gamepad detection and testing
- Interactive SVG controller visualization
- Real-time input monitoring
- Vibration testing
- Premium dark theme design
- Full responsive design
- Production-ready code
