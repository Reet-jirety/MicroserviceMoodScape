# Use the official Golang image as the base
FROM golang:1.21.0-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files to the working directory
COPY go.mod go.sum ./

# Download and cache Go modules
RUN go mod download

# Copy the entire project into the container's working directory
COPY . .

# Expose the application port
EXPOSE 8010

# Command to run the application in development mode
CMD ["go", "run", "./cmd/main.go"]
