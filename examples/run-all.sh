#!/bin/bash

# Run all Domitor examples
echo "Starting all Domitor examples..."

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
run_example "debug" "5173"
run_example "random-generator" "5174"
run_example "router" "5175"
run_example "strongly-typed-props" "5176"
run_example "signals" "5177"
run_example "classnames" "5178"

echo ""
echo "All examples are starting..."
echo "Debug: http://localhost:5173"
echo "Random Generator: http://localhost:5174"
echo "Router: http://localhost:5175"
echo "Strongly Typed Props: http://localhost:5176"
echo "Signals: http://localhost:5177"
echo "ClassNames: http://localhost:5178"
echo ""
echo "Press Ctrl+C to stop all examples"

# Wait for all background processes
wait
