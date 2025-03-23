# AI Text Formatter

A web application that converts AI-generated text (like ChatGPT responses) into properly formatted Word documents while preserving markdown formatting.

🌐 **Live Demo:** [https://ai-text-formatter.vercel.app](https://ai-text-formatter.vercel.app)

## Features

- Paste AI-generated text with markdown formatting
- Live preview of formatted text
- Convert and download as Word document (.docx)
- Modern and responsive UI with dark mode support
- Supports common markdown elements (headers, bold, italic, code blocks, lists)
- Preserves table formatting and structure

## Local Development

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

4. Access the application:
   - Production: Visit [https://ai-text-formatter.vercel.app](https://ai-text-formatter.vercel.app)
   - Local development: Open `frontend/index.html` in your browser or use a local server

## Usage

1. Visit the application at [https://ai-text-formatter.vercel.app](https://ai-text-formatter.vercel.app)
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
- Tables (preserved structure)

## Technology Stack

- Frontend: HTML, CSS, and JavaScript
- Backend: Node.js with Express
- Document conversion: docx library
- Markdown parsing: marked library
- Deployment: Vercel (frontend) and Vercel Serverless Functions (backend)

## Contributing

Feel free to open issues or submit pull requests if you have suggestions for improvements or bug fixes.

## License

GNU General Public License v3.0

## Development

- Frontend: HTML, CSS, and JavaScript
- Backend: Node.js with Express
- Document conversion: docx library
- Markdown parsing: marked library 
