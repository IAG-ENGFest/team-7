# 🛫 Airport Logistics Tycoon

A browser-based airport management game built with pure HTML, CSS, and JavaScript. Manage your airport by scheduling flights, assigning gates, and optimizing passenger flow to maximize revenue and reputation!

## 🎮 Features

### Core Gameplay
- **Flight Management**: Drag and drop incoming flights to available gates
- **Dynamic Challenges**: Handle weather delays, emergency landings, and VIP flights
- **Economy System**: Earn revenue from successful flights while managing operational costs
- **Progressive Difficulty**: More flights and challenges as days progress
- **Upgrades System**: Unlock new terminals, runways, lounges, and more

### Game Mechanics
- **4 Flight Types**: Domestic, International, Cargo, and VIP flights
- **Gate Capacity Matching**: Optimize gate assignments for maximum efficiency
- **Satisfaction System**: Keep passengers happy to maximize revenue
- **Reputation**: Build your airport's reputation through successful operations
- **Weather System**: Dynamic weather affects flight processing times
- **Day/Night Cycle**: Operational costs deducted each game day

### Technical Features
- **Canvas API**: Smooth animations of planes, gates, and airport layout
- **Web Audio API**: Dynamic sound effects for game events
- **LocalStorage**: Persistent high scores
- **Responsive Design**: Works on desktop and tablet
- **No Backend Required**: Runs entirely in the browser as static files

## 🚀 Getting Started

### Installation
1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. That's it! No build process or dependencies required.

### Running Locally
Simply open the `index.html` file in your browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

### Deploying to S3 or Static Hosting
Upload all files to your static hosting provider:
```bash
aws s3 sync . s3://your-bucket-name --exclude ".git/*"
```

## 📁 Project Structure

```
airport-tycoon/
├── index.html              # Main HTML structure
├── style.css              # All styles and responsive design
├── README.md              # This file
└── js/
    ├── main.js            # Entry point and game loop
    ├── constants.js       # Game configuration and constants
    ├── utils.js           # Helper functions
    ├── audio.js           # Audio manager for sound effects
    ├── storage.js         # LocalStorage manager
    ├── entities.js        # Game entities (Flight, Gate, Upgrade)
    ├── renderer.js        # Canvas rendering system
    ├── gameState.js       # Core game logic and state
    ├── events.js          # Event handlers (drag & drop)
    └── ui.js              # UI updates and management
```

## 🎯 How to Play

### Tutorial
When you first start the game, you'll see a tutorial explaining the basics. Here's a quick guide:

1. **Assign Flights**: Drag flight cards from the left panel to available gates on the right
2. **Match Capacity**: Try to match flight size to gate capacity for best results
3. **Monitor Progress**: Watch the progress bars as flights are processed
4. **Earn Revenue**: Completed flights generate cash based on satisfaction and efficiency
5. **Purchase Upgrades**: Use your earnings to expand your airport

### Controls
- **Drag & Drop**: Assign flights to gates
- **Click**: Purchase upgrades
- **Pause Button**: Pause/resume the game
- **Sound Button**: Toggle sound effects

### Tips
- Perfect gate matches (70-100% capacity usage) give bonus revenue
- Don't let flights wait too long - satisfaction drops over time
- VIP flights offer higher rewards but require careful handling
- Emergency flights need immediate attention
- Weather conditions affect processing times
- Balance expansion costs with operational expenses

## 🏆 Scoring

Your final score is calculated based on:
- **Cash**: Your remaining money (×0.1)
- **Reputation**: Your airport's reputation (×100)
- **Flights Completed**: Total successful flights (×50)
- **Days Survived**: How long you lasted (×500)

## 🎨 Customization

### Modifying Game Balance
Edit `js/constants.js` to adjust:
- Starting cash, satisfaction, and reputation
- Flight generation rates
- Revenue and cost amounts
- Weather effects
- Upgrade costs and effects

### Changing Visuals
Edit `style.css` to customize:
- Color scheme (CSS variables at the top)
- Layout and spacing
- Animations and transitions

Edit `js/renderer.js` to modify:
- Canvas drawings
- Airport layout
- Plane animations

### Adding New Features
The modular structure makes it easy to add:
- New flight types (add to `FLIGHT_TYPES` in constants)
- New upgrades (add to `UPGRADES` array)
- New weather conditions (add to `WEATHER` object)
- Custom events or challenges

## 🔧 Browser Compatibility

Requires a modern browser with support for:
- ES6 JavaScript
- Canvas API
- Web Audio API
- LocalStorage
- CSS Grid and Flexbox

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 Code Structure

### Module Descriptions

**constants.js**: Configuration values for game balance, flight types, gate types, weather conditions, and upgrades.

**utils.js**: Helper functions for random number generation, formatting, color calculations, and game logic utilities.

**audio.js**: Web Audio API wrapper for playing sound effects (beeps, melodies, alarms).

**storage.js**: LocalStorage manager for saving high scores and game state (future feature).

**entities.js**: Class definitions for Flight, Gate, Upgrade, and Alert objects.

**renderer.js**: Canvas rendering system that draws the airport layout, runways, gates, planes, and animations.

**gameState.js**: Core game logic including state management, flight generation, gate assignments, upgrades, weather, and game over conditions.

**events.js**: Event handlers for drag-and-drop, button clicks, and user interactions.

**ui.js**: DOM manipulation functions to update all UI elements (stats, gates, flights, alerts).

**main.js**: Entry point that initializes everything and runs the game loop.

## 🎵 Audio

The game includes procedural sound effects using the Web Audio API:
- Flight assigned beep
- Flight completed melody
- Emergency alarm
- Upgrade success fanfare
- Warning tones
- Cash register sound

Sound can be toggled on/off with the sound button.

## 🐛 Known Issues

- Canvas may not scale perfectly on very small screens (<768px)
- Audio might not play on first interaction due to browser autoplay policies
- LocalStorage has a size limit (~5-10MB depending on browser)

## 🚧 Future Enhancements

Potential features to add:
- Multiple airports/levels
- Different aircraft types with unique characteristics
- Staff hiring and management
- Airport incidents (delays, maintenance, etc.)
- Seasonal events and holidays
- Multiplayer leaderboards
- Mobile touch controls optimization
- Save/load game state

## 📜 License

This project is open source and available for educational purposes. Feel free to modify and extend it!

## 🤝 Contributing

This is a standalone game project. Feel free to fork and create your own version!

## 📧 Support

For issues or questions, please refer to the code comments or create an issue in the repository.

---

**Enjoy managing your airport! Good luck, Tycoon! 🛫✨**
