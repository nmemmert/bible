const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

console.log('📄 Processing PDF Resources for Bible Study Integration...\n');

// PDF files to process
const pdfFiles = [
    {
        filename: 'bsb_concordance.pdf',
        description: 'BSB Concordance',
        type: 'concordance'
    },
    {
        filename: 'bib.pdf',
        description: 'Greek New Testament (Bib)',
        type: 'bible_version'
    },
    {
        filename: 'bgb.pdf',
        description: 'Interlinear Bible (BGB)',
        type: 'interlinear'
    }
];

// Function to extract text from PDF
async function extractPdfText(pdfPath) {
    try {
        console.log(`📖 Reading: ${path.basename(pdfPath)}`);
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await new pdfParse.PDFParse(dataBuffer);

        return {
            text: data.text || '',
            pages: data.numpages || 0,
            info: data.info || {}
        };
    } catch (error) {
        console.error(`❌ Error reading ${path.basename(pdfPath)}:`, error.message);
        return null;
    }
}

// Function to analyze concordance data
function analyzeConcordance(text) {
    console.log('🔍 Analyzing concordance data...');

    // Look for Strong's number patterns
    const strongsPattern = /\b[G|H]\d{1,4}\b/g;
    const strongsNumbers = text.match(strongsPattern) || [];

    // Look for Bible references
    const referencePattern = /\b\d?\s?[A-Za-z]+\s\d{1,3}:\d{1,3}/g;
    const references = text.match(referencePattern) || [];

    // Look for Greek words (basic detection)
    const greekPattern = /[\u0370-\u03FF\u1F00-\u1FFF]+/g;
    const greekWords = text.match(greekPattern) || [];

    return {
        strongsNumbers: [...new Set(strongsNumbers)],
        references: [...new Set(references)],
        greekWords: [...new Set(greekWords)],
        totalWords: text.split(/\s+/).length
    };
}

// Function to analyze Bible text
function analyzeBibleText(text) {
    console.log('📚 Analyzing Bible text...');

    // Count verses (rough estimate)
    const versePattern = /\d{1,3}:\d{1,3}/g;
    const verses = text.match(versePattern) || [];

    // Count chapters
    const chapterPattern = /\b\d{1,2}\s+[A-Za-z]+/g;
    const chapters = text.match(chapterPattern) || [];

    // Detect language
    const greekChars = (text.match(/[\u0370-\u03FF\u1F00-\u1FFF]/g) || []).length;
    const englishChars = (text.match(/[a-zA-Z]/g) || []).length;

    const isGreek = greekChars > englishChars * 0.1;

    return {
        verses: [...new Set(verses)],
        chapters: [...new Set(chapters)],
        isGreek,
        language: isGreek ? 'greek' : 'english',
        totalWords: text.split(/\s+/).length
    };
}

// Function to create downloadable resource entry
function createResourceEntry(pdfInfo, analysis, filename) {
    return {
        filename,
        title: pdfInfo.description,
        type: pdfInfo.type,
        pages: analysis.pages,
        fileSize: fs.statSync(path.join(__dirname, filename)).size,
        analysis,
        downloadUrl: `/resources/${filename}`,
        description: getResourceDescription(pdfInfo.type, analysis),
        created_at: new Date().toISOString()
    };
}

// Function to get resource description
function getResourceDescription(type, analysis) {
    switch (type) {
        case 'concordance':
            return `Concordance with ${analysis.strongsNumbers?.length || 0} Strong's numbers and ${analysis.references?.length || 0} Bible references.`;
        case 'bible_version':
            return `Bible version with ${analysis.verses?.length || 0} verses in ${analysis.language}.`;
        case 'interlinear':
            return `Interlinear Bible with ${analysis.verses?.length || 0} verses, combining original language and translation.`;
        default:
            return 'Additional Bible study resource.';
    }
}

// Main processing function
async function processPdfs() {
    const results = [];

    for (const pdfFile of pdfFiles) {
        const pdfPath = path.join(__dirname, pdfFile.filename);

        if (!fs.existsSync(pdfPath)) {
            console.log(`⚠️  File not found: ${pdfFile.filename}`);
            continue;
        }

        // Extract text
        const pdfData = await extractPdfText(pdfPath);
        if (!pdfData) continue;

        // Analyze content based on type
        let analysis;
        switch (pdfFile.type) {
            case 'concordance':
                analysis = analyzeConcordance(pdfData.text);
                break;
            case 'bible_version':
            case 'interlinear':
                analysis = analyzeBibleText(pdfData.text);
                break;
            default:
                analysis = { totalWords: pdfData.text.split(/\s+/).length };
        }

        // Add PDF metadata
        analysis.pages = pdfData.pages;
        analysis.info = pdfData.info;

        // Create resource entry
        const resourceEntry = createResourceEntry(pdfFile, analysis, pdfFile.filename);
        results.push(resourceEntry);

        console.log(`✅ Processed: ${pdfFile.description}`);
        console.log(`   Pages: ${analysis.pages}, Words: ${analysis.totalWords}\n`);
    }

    return results;
}

// Function to save results
function saveResults(results) {
    const outputPath = path.join(__dirname, 'pdf_resources.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`💾 Results saved to: ${outputPath}`);

    // Also create a summary
    const summaryPath = path.join(__dirname, 'pdf_resources_summary.txt');
    let summary = 'PDF Resources Integration Summary\n';
    summary += '=' .repeat(40) + '\n\n';

    results.forEach(resource => {
        summary += `${resource.title}\n`;
        summary += '-'.repeat(resource.title.length) + '\n';
        summary += `Type: ${resource.type}\n`;
        summary += `Pages: ${resource.pages}\n`;
        summary += `File Size: ${Math.round(resource.fileSize / 1024)} KB\n`;
        summary += `Description: ${resource.description}\n\n`;
    });

    fs.writeFileSync(summaryPath, summary);
    console.log(`📋 Summary saved to: ${summaryPath}`);
}

// Function to create integration suggestions
function createIntegrationSuggestions(results) {
    console.log('\n🚀 Integration Suggestions:');
    console.log('=' .repeat(30));

    results.forEach(resource => {
        console.log(`\n${resource.title}:`);

        switch (resource.type) {
            case 'concordance':
                console.log('  • Add to Lexicon component as "Concordance Lookup"');
                console.log('  • Integrate Strong\'s numbers with existing lexicon');
                console.log('  • Create concordance search feature');
                break;
            case 'bible_version':
                console.log('  • Add as downloadable Bible version');
                console.log('  • Integrate with Bible reader if text can be extracted');
                console.log('  • Add to version selection menu');
                break;
            case 'interlinear':
                console.log('  • Add as premium study resource');
                console.log('  • Create interlinear view component');
                console.log('  • Link with lexicon for word studies');
                break;
        }
    });
}

// Run the processing
processPdfs()
    .then(results => {
        saveResults(results);
        createIntegrationSuggestions(results);

        console.log('\n✅ PDF processing complete!');
        console.log('📄 Ready for integration into your Bible study application.');
    })
    .catch(error => {
        console.error('❌ Error processing PDFs:', error);
    });