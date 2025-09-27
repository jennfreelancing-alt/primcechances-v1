// Script to analyze the actual RemoteOK page structure
const analyzeRemoteOKStructure = async () => {
  console.log('🔍 Analyzing RemoteOK page structure...\n');
  
  const testUrl = 'https://remoteok.com/remote-jobs/remote-software-engineer-data-infrastructure-acquisition-speechify-1093699';
  
  try {
    const response = await fetch(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    const html = await response.text();
    
    // Extract and analyze the structure
    console.log('📊 Analyzing HTML structure...\n');
    
    // Look for common container patterns
    const containerPatterns = [
      /<div[^>]*class="[^"]*job[^"]*"[^>]*>/gi,
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>/gi,
      /<div[^>]*class="[^"]*description[^"]*"[^>]*>/gi,
      /<div[^>]*class="[^"]*markdown[^"]*"[^>]*>/gi,
      /<div[^>]*class="[^"]*post[^"]*"[^>]*>/gi,
      /<div[^>]*class="[^"]*listing[^"]*"[^>]*>/gi,
      /<div[^>]*class="[^"]*detail[^"]*"[^>]*>/gi,
      /<div[^>]*class="[^"]*main[^"]*"[^>]*>/gi,
      /<div[^>]*class="[^"]*body[^"]*"[^>]*>/gi,
      /<div[^>]*class="[^"]*text[^"]*"[^>]*>/gi
    ];
    
    console.log('🔍 Found container patterns:');
    containerPatterns.forEach((pattern, index) => {
      const matches = html.match(pattern);
      if (matches) {
        console.log(`  Pattern ${index + 1}: Found ${matches.length} matches`);
        // Show first few matches
        matches.slice(0, 3).forEach(match => {
          console.log(`    ${match.substring(0, 100)}...`);
        });
      }
    });
    
    // Look for specific text content areas
    console.log('\n🔍 Looking for content areas around key text...');
    
    const keyTexts = [
      'Speechify is hiring',
      'The mission of Speechify',
      'What You\'ll Do',
      'An Ideal Candidate Should Have'
    ];
    
    keyTexts.forEach(text => {
      const index = html.indexOf(text);
      if (index !== -1) {
        // Extract surrounding HTML structure
        const start = Math.max(0, index - 200);
        const end = Math.min(html.length, index + 200);
        const context = html.substring(start, end);
        
        console.log(`\n📍 Context around "${text}":`);
        console.log(context.replace(/\s+/g, ' ').trim());
        
        // Look for parent container tags
        const beforeContext = html.substring(Math.max(0, index - 1000), index);
        const afterContext = html.substring(index, Math.min(html.length, index + 1000));
        
        // Find opening tags before the text
        const openingTags = beforeContext.match(/<[^>]+>/g) || [];
        const closingTags = afterContext.match(/<\/[^>]+>/g) || [];
        
        console.log(`  Opening tags before: ${openingTags.slice(-5).join(' ')}`);
        console.log(`  Closing tags after: ${closingTags.slice(0, 5).join(' ')}`);
      }
    });
    
    // Look for common HTML patterns
    console.log('\n🔍 Analyzing common HTML patterns...');
    
    const patterns = [
      { name: 'div tags', regex: /<div[^>]*>/gi },
      { name: 'span tags', regex: /<span[^>]*>/gi },
      { name: 'p tags', regex: /<p[^>]*>/gi },
      { name: 'section tags', regex: /<section[^>]*>/gi },
      { name: 'article tags', regex: /<article[^>]*>/gi },
      { name: 'main tags', regex: /<main[^>]*>/gi }
    ];
    
    patterns.forEach(pattern => {
      const matches = html.match(pattern.regex);
      if (matches) {
        console.log(`  ${pattern.name}: ${matches.length} found`);
        // Show unique class patterns
        const classes = matches
          .map(match => match.match(/class="([^"]*)"/))
          .filter(Boolean)
          .map(match => match[1])
          .filter(Boolean);
        
        const uniqueClasses = [...new Set(classes)];
        if (uniqueClasses.length > 0) {
          console.log(`    Sample classes: ${uniqueClasses.slice(0, 5).join(', ')}`);
        }
      }
    });
    
    // Extract a sample of the actual content structure
    console.log('\n📝 Sample content structure:');
    const contentStart = html.indexOf('Speechify is hiring');
    if (contentStart !== -1) {
      const sample = html.substring(contentStart, contentStart + 2000);
      console.log(sample.replace(/\s+/g, ' ').trim());
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
};

analyzeRemoteOKStructure();
