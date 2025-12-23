###############
# Build Stage #
###############
FROM hugomods/hugo:exts-0.153.2 AS builder

COPY . /src

ENV HUGO_ENV=production

# Base URL
ARG HUGO_BASEURL=
ENV HUGO_BASEURL=${HUGO_BASEURL}

# Module Proxy
ARG HUGO_MODULE_PROXY=
ENV HUGO_MODULE_PROXY=${HUGO_MODULE_PROXY}

# NPM mirrors, such as https://registry.npmmirror.com
ARG NPM_CONFIG_REGISTRY=
ENV NPM_CONFIG_REGISTRY=${NPM_CONFIG_REGISTRY}

ARG BUILD_FUTURE_FLAG=""

# Install dependencies
RUN npm i

# Build site
RUN hugo --minify --gc --enableGitInfo ${BUILD_FUTURE_FLAG}

# Set the fallback 404 page if defaultContentLanguageInSubdir is enabled, please replace the `en` with your default language code.
# RUN cp ./public/en/404.html ./public/404.html

###############
# Final Stage #
###############
FROM hugomods/hugo:nginx-1.29.1
COPY --from=builder /src/public /site
