#!/bin/bash
set -e

echo ""
echo "  ╔═══════════════════════════════╗"
echo "  ║       CAMcq — MCQ Learner     ║"
echo "  ╚═══════════════════════════════╝"
echo ""

# Check for Node.js
if ! command -v node &>/dev/null; then
  echo "  Node.js not found. Installing via Homebrew..."
  if ! command -v brew &>/dev/null; then
    echo "  Installing Homebrew first..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    # Add homebrew to PATH for Apple Silicon
    if [ -f "/opt/homebrew/bin/brew" ]; then
      eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
  fi
  brew install node
  echo "  ✓ Node.js installed"
else
  echo "  ✓ Node.js $(node --version) found"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "  Installing dependencies (first run only)..."
  npm install --silent
  echo "  ✓ Dependencies installed"
else
  echo "  ✓ Dependencies already installed"
fi

echo ""
echo "  Starting CAMcq..."
echo "  Drop your question JSON files into: data/questions/"
echo ""

# Start the app and open browser after a short delay
(sleep 2 && open http://localhost:5173) &
npm run dev
