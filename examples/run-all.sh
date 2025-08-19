#!/bin/bash

# Run all Thorix examples
echo "Starting all Thorix examples..."

# Function to run an example
run_example() {
    local example=$1
    local port=$2

    echo "Starting $example on port $port..."
    cd "$example"
    npm install --silent
    npm run dev &
    cd ..
}
# Start all examples

run_example "signals" "5177"
run_example "classnames" "5178"
run_example "i18n-inline-demo" "3001"
run_example "router" "5175"

echo ""
echo "All examples are starting..."
echo "Signals: http://localhost:5177"
echo "ClassNames: http://localhost:5178"
echo "Inline i18n: http://localhost:3001"
echo "Router: http://localhost:5175"
echo ""
echo "Press Ctrl+C to stop all examples"

# Wait for all background processes
wait
