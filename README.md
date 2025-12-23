# Blockfall

A competitive 2-player Tetris-like game built with Phaser 3.

## Features
- **Split-screen gameplay**: Two independent game boards for head-to-head competition.
- **Classic mechanics**: Piece rotation, gravity, and line clearing.
- **Blinking animation**: Visual feedback when clearing lines.
- **Phaser 3**: Powered by a robust game framework for smooth performance.
- **Unit Tested**: Core logic verified with Mocha and Chai.

## Controls

### Player 1 (Left)
- **W**: Rotate
- **A**: Move Left
- **S**: Soft Drop
- **D**: Move Right

### Player 2 (Right)
- **Up Arrow**: Rotate
- **Left Arrow**: Move Left
- **Down Arrow**: Soft Drop
- **Right Arrow**: Move Right

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your system.

### Installation
1. Clone the repository or download the files.
2. Open your terminal in the project directory.
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Game
Start the local server:
```bash
npm start
```
The game will be available at [http://localhost:8080](http://localhost:8080).

### Running Tests
Automated unit tests are available at [http://localhost:8080/tests.html](http://localhost:8080/tests.html) while the server is running.

## Deployment

### Vercel
1. Push your code to a GitHub repository.
2. Log in to [Vercel](https://vercel.com/).
3. Click "Add New" -> "Project".
4. Import your GitHub repository.
5. Vercel will automatically detect the static project. Click **Deploy**.
6. Once deployed, you can access your game via the provided Vercel URL.
