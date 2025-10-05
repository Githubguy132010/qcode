# Use Node.js 20 LTS with Debian Bookworm
ARG NODE_IMAGE="node:20-bookworm"
FROM ${NODE_IMAGE}

# Add labels for better maintainability
LABEL maintainer="qcode-dev" \
      version="2.0" \
      description="Optimized secure development container for QCode project with enhanced caching and health checks"

# Install security updates and required packages in a single optimized layer
# Use non-interactive mode and security-focused apt configuration
RUN apt-get update \
    && apt-get upgrade -y \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        # Essential development tools
        git \
        curl \
        wget \
        vim \
        htop \
        # Security and monitoring tools
        ca-certificates \
        gnupg \
        apt-transport-https \
        # Additional tools for health checks and process management
        procps \
        netcat-traditional \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Install pnpm with specific version for reproducible builds
# Verify the installation for security
ENV PNPM_VERSION="8.15.6"
RUN npm install -g pnpm@${PNPM_VERSION} \
    && pnpm --version \
    && npm cache clean --force

# Use the existing node user for consistency
# Set proper home directory permissions
ENV USERNAME=node
ENV USER_UID=1000
ENV USER_GID=1000

# Ensure proper permissions for the node user
RUN mkdir -p /home/$USERNAME \
    && chown -R $USERNAME:$USERNAME /home/$USERNAME \
    && chmod 755 /home/$USERNAME

# Set the working directory
WORKDIR /workspaces/qcode

# Pre-create workspace directory with proper permissions
RUN mkdir -p /workspaces/qcode \
    && chown -R $USERNAME:$USERNAME /workspaces/qcode \
    && chmod 755 /workspaces/qcode

# Switch to the non-root user for security
USER $USERNAME

# Set environment variables for pnpm and security
ENV PNPM_HOME="/home/$USERNAME/.local/share/pnpm" \
    PATH="/home/$USERNAME/.local/share/pnpm:$PATH" \
    # Security-related environment variables
    NODE_ENV="development" \
    NPM_CONFIG_AUDIT="true" \
    NPM_CONFIG_FUND="false" \
    # Disable update notifier for security
    NO_UPDATE_NOTIFIER="1" \
    # Performance optimizations
    NODE_OPTIONS="--max-old-space-size=4096" \
    # Development server optimizations
    TURBOPACK=1

# Create pnpm cache directory with proper permissions
RUN mkdir -p $PNPM_HOME \
    && chmod 755 $PNPM_HOME

# Copy package files first for better layer caching
# This layer will only change when package files change
COPY --chown=$USERNAME:$USERNAME package.json pnpm-lock.yaml* ./

# Install dependencies in a separate layer for caching
# Use frozen lockfile for reproducible builds, with fallback for compatibility
RUN pnpm install --frozen-lockfile || pnpm install \
    && pnpm store prune \
    && rm -rf ~/.npm

# Copy source code after dependencies are installed
# This layer will only rebuild when source code changes
COPY --chown=$USERNAME:$USERNAME . .

# Create necessary directories for the application
RUN mkdir -p /workspaces/qcode/.next /workspaces/qcode/node_modules/.cache

# Expose port 3000 for the Next.js development server
EXPOSE 3000

# Set the default command to keep container running for development
CMD ["sleep", "infinity"]