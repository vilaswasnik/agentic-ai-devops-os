#!/bin/bash

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOCS_DIR="$PROJECT_ROOT/public/scripts/documents"
SCRIPTS_DIR="$PROJECT_ROOT/scripts"

echo "Enter the base name of your knowledge document (e.g., knowledgeBase, urbancode_deploy_knowledgebase):"
read DOC_NAME

DOC_PATH="$DOCS_DIR/${DOC_NAME}.json"

if [ ! -f "$DOC_PATH" ]; then
  echo "❌ Document $DOC_PATH does not exist."
  exit 1
fi

# Suggest default script name
DEFAULT_SCRIPT="generate${DOC_NAME^}Embeddings.js"
echo "Enter the embedding script to use (default: $DEFAULT_SCRIPT):"
read SCRIPT_NAME

if [ -z "$SCRIPT_NAME" ]; then
  SCRIPT_NAME="$DEFAULT_SCRIPT"
fi

SCRIPT_PATH="$SCRIPTS_DIR/$SCRIPT_NAME"

if [ ! -f "$SCRIPT_PATH" ]; then
  echo "❌ Embedding script $SCRIPT_PATH does not exist."
  exit 1
fi

echo "Running embedding script..."
node "$SCRIPT_PATH"

EMBED_PATH="$DOCS_DIR/${DOC_NAME}_embeddings.json"
if [ -f "$EMBED_PATH" ]; then
  echo "✅ Embeddings generated: $EMBED_PATH"
else
  echo "❌ Embeddings file was not created."
fi