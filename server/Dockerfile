# Use an official Go runtime as a parent image
FROM golang:latest

# Set the working directory inside the container
WORKDIR /server

# Copy the local code to the container's workspace
COPY . .

# Build the Go application (Install dependencies)
RUN go build -o /server/myapp

# Run the Go application
CMD ["go", "run", "main.go"]
