#!/bin/bash

# Define the folder and file name
FOLDER_NAME="my_folder"
FILE_NAME="my_file.txt"

# Create the folder
if [ ! -d "$FOLDER_NAME" ]; then
  mkdir "$FOLDER_NAME"
  echo "Folder '$FOLDER_NAME' created."
else
  echo "Folder '$FOLDER_NAME' already exists."
fi

# Create the file inside the folder
FILE_PATH="$FOLDER_NAME/$FILE_NAME"
if [ ! -f "$FILE_PATH" ]; then
  touch "$FILE_PATH"
  echo "File '$FILE_NAME' created inside '$FOLDER_NAME'."
else
  echo "File '$FILE_NAME' already exists inside '$FOLDER_NAME'."
fi