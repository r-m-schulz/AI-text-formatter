const express = require('express');
const cors = require('cors');
const { marked } = require('marked');
const docx = require('docx');
const { Document, Paragraph, TextRun, Packer, Table, TableRow, TableCell, WidthType, BorderStyle } = docx;

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// Configure marked to handle line breaks and tables
marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: false,
    tables: true
});

// Helper function to parse inline markdown and create TextRuns
function parseInlineMarkdown(text) {
    const runs = [];
    let currentText = '';
    let isBold = false;
    let isItalic = false;
    let isCode = false;

    // Helper to add current text with current formatting
    function addCurrentText() {
        if (currentText) {
            runs.push(
                new TextRun({
                    text: currentText,
                    bold: isBold,
                    italics: isItalic,
                    font: isCode ? 'Courier New' : undefined,
                    size: 20 // 10pt font for regular text
                })
            );
            currentText = '';
        }
    }

    let i = 0;
    while (i < text.length) {
        if (text[i] === '*' && text[i + 1] === '*') {
            // Bold
            addCurrentText();
            isBold = !isBold;
            i += 2;
        } else if (text[i] === '*') {
            // Italic
            addCurrentText();
            isItalic = !isItalic;
            i++;
        } else if (text[i] === '`') {
            // Inline code
            addCurrentText();
            isCode = !isCode;
            i++;
        } else {
            currentText += text[i];
            i++;
        }
    }

    addCurrentText();
    return runs;
}

// Helper function to clean markdown symbols from text
function cleanMarkdownText(text) {
    return text
        .replace(/^\s*#{1,6}\s+/, '') // Remove header symbols
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold symbols
        .replace(/\*(.*?)\*/g, '$1') // Remove italic symbols
        .replace(/`(.*?)`/g, '$1') // Remove code symbols
        .trim();
}

// Helper function to split text into paragraphs
function splitIntoParagraphs(text) {
    // Split on double newlines or single newlines
    return text.split(/\n{2,}|\n/).map(p => p.trim()).filter(p => p);
}

// Helper function to clean bullet point text
function cleanBulletPointText(text) {
    // Remove bullet point markers (•, -, and any combination of them)
    return text.replace(/^[•\-\s]+/, '').trim();
}

// Helper function to parse markdown table
function parseTable(tableText) {
    console.log('Attempting to parse table text:', tableText);
    
    // Split into lines and clean up
    const lines = tableText.split('\n')
        .map(line => line.trim())
        .filter(line => line && line !== '|');  // Remove empty lines and lines with just pipes
    
    console.log('Table lines after cleanup:', lines);
    
    if (lines.length < 3) {
        console.log('Not enough lines for a table, need at least 3');
        return null; // Need at least header, separator, and one data row
    }
    
    // Process each line to extract cells
    const processLine = line => {
        const cells = line
            .split('|')
            .map(cell => cell.trim())
            .filter(cell => cell);  // Remove empty cells
        console.log('Processed line into cells:', cells);
        return cells;
    };

    // Get headers, separator, and rows
    const headerRow = processLine(lines[0]);
    const separatorRow = lines[1];
    const dataRows = lines.slice(2).map(processLine);

    console.log('Header row:', headerRow);
    console.log('Separator row:', separatorRow);
    console.log('Data rows:', dataRows);

    // Validate separator row (should contain only -, :, and |)
    const isSeparatorValid = separatorRow.replace(/[\-:|]/g, '').trim() === '';
    console.log('Is separator valid:', isSeparatorValid);
    
    if (!isSeparatorValid || !headerRow.length || !dataRows.length) {
        console.log('Table validation failed:', {
            isSeparatorValid,
            hasHeaders: headerRow.length > 0,
            hasData: dataRows.length > 0
        });
        return null;
    }

    return {
        headers: headerRow,
        rows: dataRows
    };
}

// Helper function to create a table cell with content
function createTableCell(text, isHeader = false) {
    return new TableCell({
        children: [new Paragraph({
            children: parseInlineMarkdown(text),
            spacing: { before: 50, after: 50 }
        })],
        width: {
            size: 2500, // Width in twips (adjust based on number of columns)
            type: WidthType.DXA
        },
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 }
        },
        verticalAlign: "center",
        shading: isHeader ? { fill: "E7E6E6" } : undefined
    });
}

// Helper function to create a table
function createTable(headers, rows) {
    // Calculate cell width based on number of columns
    const cellWidth = Math.floor(9000 / headers.length); // 9000 twips total width

    return new Table({
        width: {
            size: 9000, // About 6.25 inches
            type: WidthType.DXA
        },
        rows: [
            // Header row
            new TableRow({
                children: headers.map(header => 
                    new TableCell({
                        children: [new Paragraph({
                            children: parseInlineMarkdown(header),
                            spacing: { before: 50, after: 50 }
                        })],
                        width: { size: cellWidth, type: WidthType.DXA },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1 },
                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                            left: { style: BorderStyle.SINGLE, size: 1 },
                            right: { style: BorderStyle.SINGLE, size: 1 }
                        },
                        verticalAlign: "center",
                        shading: { fill: "E7E6E6" }
                    })
                ),
                tableHeader: true,
                height: { value: 400, rule: 'atLeast' }
            }),
            // Data rows
            ...rows.map(row => 
                new TableRow({
                    children: row.map(cell => 
                        new TableCell({
                            children: [new Paragraph({
                                children: parseInlineMarkdown(cell),
                                spacing: { before: 50, after: 50 }
                            })],
                            width: { size: cellWidth, type: WidthType.DXA },
                            borders: {
                                top: { style: BorderStyle.SINGLE, size: 1 },
                                bottom: { style: BorderStyle.SINGLE, size: 1 },
                                left: { style: BorderStyle.SINGLE, size: 1 },
                                right: { style: BorderStyle.SINGLE, size: 1 }
                            },
                            verticalAlign: "center"
                        })
                    ),
                    height: { value: 300, rule: 'atLeast' }
                })
            )
        ],
        margins: {
            top: 100,
            bottom: 100,
            left: 100,
            right: 100
        }
    });
}

// Helper function to convert markdown to docx elements
function markdownToDocxElements(markdown) {
    const tokens = marked.lexer(markdown);
    console.log('Parsed tokens:', tokens);
    const elements = [];
    let isFirstH1 = true;  // Track if we're processing the first h1

    tokens.forEach(token => {
        switch (token.type) {
            case 'heading': {
                // Smaller heading sizes (h1 = 16pt, h2 = 14pt, h3 = 12pt, etc.)
                const fontSize = token.depth === 1 ? 20 :  // Slightly bigger h1 (20pt instead of 16pt)
                               Math.max(16 - ((token.depth - 1) * 2), 12);  // Other headings unchanged
                
                // Calculate spacing based on heading level
                const spacingBefore = token.depth === 1 ? 300 : // Slightly more space before h1
                                    150; // Standard space for other headings

                // Determine if we should add a page break
                const shouldAddPageBreak = token.depth === 1 && !isFirstH1;
                if (token.depth === 1) isFirstH1 = false;  // Mark that we've seen the first h1
                
                elements.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: cleanMarkdownText(token.text),
                                bold: true,
                                size: fontSize * 2
                            })
                        ],
                        spacing: { 
                            before: spacingBefore, 
                            after: 100,
                            line: 300 // Slightly increased line spacing
                        },
                        pageBreakBefore: shouldAddPageBreak,  // Only add page break for non-first h1
                        keepNext: true  // Keep all headings with their content
                    })
                );
                break;
            }

            case 'paragraph': {
                // Handle bullet points within paragraphs
                const lines = token.text.split('\n');
                lines.forEach(line => {
                    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                        const bulletText = line.trim().substring(1).trim();
                        elements.push(
                            new Paragraph({
                                children: [
                                    new TextRun({ text: '• ', size: 20 }),
                                    ...parseInlineMarkdown(bulletText)
                                ],
                                spacing: { 
                                    before: 100, 
                                    after: 100,
                                    line: 300
                                },
                                indent: { left: 360 }
                            })
                        );
                    } else {
                        elements.push(
                            new Paragraph({
                                children: parseInlineMarkdown(line),
                                spacing: { 
                                    before: 100, 
                                    after: 100,
                                    line: 300
                                }
                            })
                        );
                    }
                });
                break;
            }

            case 'list': {
                token.items.forEach(item => {
                    elements.push(
                        new Paragraph({
                            children: [
                                new TextRun({ text: '• ', size: 20 }),
                                ...parseInlineMarkdown(item.text)
                            ],
                            spacing: { before: 100, after: 100 },
                            indent: { left: 360 }
                        })
                    );
                });
                break;
            }

            case 'table': {
                console.log('Processing table:', token);
                const table = new Table({
                    width: {
                        size: 9000, // About 6.25 inches
                        type: WidthType.DXA
                    },
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 }
                    },
                    rows: [
                        // Header row
                        new TableRow({
                            children: token.header.map(header => 
                                new TableCell({
                                    children: [new Paragraph({
                                        children: parseInlineMarkdown(header.text),
                                        spacing: { before: 50, after: 50 }
                                    })],
                                    width: {
                                        size: Math.floor(9000 / token.header.length),
                                        type: WidthType.DXA
                                    },
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 1 },
                                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                                        left: { style: BorderStyle.SINGLE, size: 1 },
                                        right: { style: BorderStyle.SINGLE, size: 1 }
                                    },
                                    verticalAlign: "center",
                                    shading: { fill: "E7E6E6" }
                                })
                            ),
                            tableHeader: true
                        }),
                        // Data rows
                        ...token.rows.map(row => 
                            new TableRow({
                                children: row.map(cell => 
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: parseInlineMarkdown(cell.text),
                                            spacing: { before: 50, after: 50 }
                                        })],
                                        width: {
                                            size: Math.floor(9000 / token.header.length),
                                            type: WidthType.DXA
                                        },
                                        borders: {
                                            top: { style: BorderStyle.SINGLE, size: 1 },
                                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                                            left: { style: BorderStyle.SINGLE, size: 1 },
                                            right: { style: BorderStyle.SINGLE, size: 1 }
                                        },
                                        verticalAlign: "center"
                                    })
                                )
                            })
                        )
                    ]
                });
                elements.push(table);
                break;
            }

            case 'hr': {
                elements.push(
                    new Paragraph({
                        children: [new TextRun({ text: '⎯'.repeat(50), size: 20 })],
                        spacing: { before: 200, after: 200 }
                    })
                );
                break;
            }

            case 'space': {
                elements.push(
                    new Paragraph({
                        children: [new TextRun({ text: '' })],
                        spacing: { before: 100, after: 100 }
                    })
                );
                break;
            }
        }
    });

    return elements;
}

app.post('/api/convert', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'No text provided' });
        }

        console.log('Input markdown:', text);
        
        // Create document
        const doc = new Document({
            sections: [{
                properties: {},
                children: markdownToDocxElements(text)
            }]
        });

        // Generate document buffer
        const buffer = await Packer.toBuffer(doc);

        // Send response
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename=converted-document.docx');
        res.send(buffer);
    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({ error: 'Failed to convert document' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 