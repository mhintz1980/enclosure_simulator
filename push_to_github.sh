#!/bin/bash

# 1. Initialize git if it hasn't been already
if [ ! -d ".git" ]; then
    echo "Initializing local Git repository..."
    git init
fi

# 2. Add all project files
echo "Staging project files..."
git add .

# 3. Create initial commit
echo "Committing files..."
git commit -m "feat: initial commit of generator acoustic enclosure simulator"

# 4. Ensure we are on the 'main' branch
git branch -M main

# ... (steps 1-4 remain the same)

# 5. Handle remote configuration safely
echo "Configuring GitHub remote..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/mhintz1980/enclosure_simulator.git

# 6. Push to GitHub
echo "Pushing code to GitHub..."
git push -u origin main

echo "✅ Deployment complete! Check your repository at https://github.com/mhintz1980/enclosure_simulator"