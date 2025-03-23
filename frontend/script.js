document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const convertBtn = document.getElementById('convertBtn');
    const previewContent = document.getElementById('previewContent');
    const themeToggle = document.getElementById('themeToggle');

    // Theme handling
    const theme = localStorage.getItem('theme') || 'light';
    document.body.className = theme + '-mode';

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.className.includes('light') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.className = newTheme + '-mode';
        localStorage.setItem('theme', newTheme);
    });

    // Function to convert markdown to HTML for preview
    function convertMarkdownToHTML(text) {
        // Basic markdown conversion rules
        let html = text
            // Headers
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Code blocks
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            // Inline code
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // Lists
            .replace(/^\s*\- (.*$)/gm, '<li>$1</li>')
            // Tables (simplified preview)
            .replace(/^\|(.*)\|$/gm, '<div class="table-row">$1</div>')
            // Paragraphs
            .replace(/\n\n/g, '</p><p>')
            // Line breaks
            .replace(/\n/g, '<br>');

        return `<p>${html}</p>`;
    }

    // Live preview with debounce
    let previewTimeout;
    inputText.addEventListener('input', () => {
        clearTimeout(previewTimeout);
        previewTimeout = setTimeout(() => {
            const convertedText = convertMarkdownToHTML(inputText.value);
            previewContent.innerHTML = convertedText;
        }, 300);
    });

    // Handle conversion and download
    convertBtn.addEventListener('click', async () => {
        const text = inputText.value;
        if (!text.trim()) {
            alert('Please enter some text to convert!');
            return;
        }

        try {
            convertBtn.disabled = true;
            convertBtn.innerHTML = '<span class="button-text">Converting...</span><span class="button-icon">⏳</span>';
            
            // Send to backend for conversion
            const apiUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:3000/api/convert'
                : 'https://ai-text-formatter.vercel.app/api/convert';
                
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Conversion failed');
            }

            // Trigger download of the converted file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'converted-document.docx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Detailed error:', error);
            alert('Failed to convert the document. Please check the console for details.');
        } finally {
            convertBtn.disabled = false;
            convertBtn.innerHTML = '<span class="button-text">Convert & Download</span><span class="button-icon">📄</span>';
        }
    });
}); 