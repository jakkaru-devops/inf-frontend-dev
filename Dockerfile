# Stage 1: Build the application
FROM node:18.12-slim as builder

WORKDIR /usr/src/app

RUN apt-get update

COPY package.json ./
COPY .env ./

RUN yarn install --production=true

COPY . .

RUN yarn build

# Stage 2: Run the application
FROM node:18.12-slim as production

WORKDIR /usr/src/app

# Copy only the built files from the builder stage
COPY --from=builder /usr/src/app ./next

# Install any necessary runtime dependencies (if needed)
RUN yarn install --production

# Add any runtime environment variables (if needed)
COPY --from=builder /usr/src/app/.env ./

# Set the command to run the application
CMD ["yarn", "start"]


