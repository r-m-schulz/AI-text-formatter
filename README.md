# AI Text Formatter

A web application that converts AI-generated text (like ChatGPT responses) into properly formatted Word documents while preserving markdown formatting.

## Features

- Paste AI-generated text with markdown formatting
- Live preview of formatted text
- Convert and download as Word document (.docx)
- Modern and responsive UI
- Supports common markdown elements (headers, bold, italic, code blocks, lists)

## Setup

1. Install Node.js if you haven't already (https://nodejs.org)

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

4. Open the frontend:
   - Use VS Code's Live Server extension to serve the frontend directory
   - Right-click on `frontend/index.html` and select "Open with Live Server"

## Usage

1. Open the application in your browser (typically at http://127.0.0.1:5500/frontend/index.html)
2. Paste your AI-generated text into the input field
3. The preview section will show you how the text will be formatted
4. Click "Convert & Download" to get your formatted Word document

## Supported Markdown Features

- Headers (# for h1, ## for h2, ### for h3)
- Bold text (**text**)
- Italic text (*text*)
- Code blocks (```code```)
- Inline code (`code`)
- Lists (- item)

## Development

- Frontend: HTML, CSS, and JavaScript
- Backend: Node.js with Express
- Document conversion: docx library
- Markdown parsing: marked library 