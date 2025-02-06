// Helper function to properly capitalize titles
export const toTitleCase = (str: string) => {
  if (!str) return str;
  
  // Words that should not be capitalized (unless they're the first word)
  const minorWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet', 'with']);

  return str.toLowerCase().split(' ').map((word, index) => {
    // Always capitalize the first word
    if (index === 0) return word.charAt(0).toUpperCase() + word.slice(1);
    
    // Don't capitalize minor words
    if (minorWords.has(word)) return word;
    
    // Capitalize other words
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};
