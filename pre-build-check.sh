#!/bin/bash

# Pre-build Check Script
# Verifies all required files exist before packaging

echo "🔍 Pre-build Check"
echo "=================="
echo ""

# Required files
REQUIRED_FILES=(
    ".coze"
    "SKILL.md"
    "README.md"
    "docker-compose.yml"
    ".env.example"
    "start.sh"
    "migrate.sh"
)

# Check files
missing_files=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        missing_files+=("$file")
    fi
done

echo ""

# Check directories
echo "📁 Checking directories..."
REQUIRED_DIRS=(
    "backend/app"
    "frontend/app"
    "uploads"
    "outputs"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir/"
    else
        echo "❌ $dir/ (missing)"
        missing_files+=("$dir/")
    fi
done

echo ""

# Check .coze file content
echo "📄 Checking .coze file content..."
if [ -f ".coze" ]; then
    if grep -q "name:" .coze; then
        echo "✅ .coze contains 'name' field"
    else
        echo "❌ .coze missing 'name' field"
        missing_files+=(".coze (name field)")
    fi
fi

echo ""

# Summary
if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ All checks passed! Ready for packaging."
    exit 0
else
    echo "❌ Missing files/directories:"
    printf '%s\n' "${missing_files[@]}"
    echo ""
    echo "Please fix the missing items before packaging."
    exit 1
fi
