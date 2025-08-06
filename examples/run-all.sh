#!/bin/bash

# Run all reactive-dom examples
echo "Starting all reactive-dom examples..."

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
run_example "counter" "5173"
run_example "debug" "5174"
run_example "random-generator" "5175"
run_example "router" "5176"

echo ""
echo "All examples are starting..."
echo "Counter: http://localhost:5173"
echo "Debug: http://localhost:5174"
echo "Random Generator: http://localhost:5175"
echo "Router: http://localhost:5176"
echo ""
echo "Press Ctrl+C to stop all examples"

# Wait for all background processes
wait
