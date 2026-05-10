# Build stage
FROM node:20-alpine AS build-stage

WORKDIR /app

ARG VITE_API_URL
ENV VITE_APIR_URL=${VITE_API_URL}

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:stable-alpine AS production-stage

# Copy the custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build-stage to Nginx default directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
