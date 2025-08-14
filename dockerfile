# Use a prebuilt Node + Chromium image
FROM browserless/chrome:1.81-chrome-stable-node20

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app files
COPY . .

# Set Puppeteer executable path (already correct in this image)
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "index.js"]
