/* ===================================
   DOM ELEMENTS SELECTION
   =================================== */
// Text input and checkboxes
const textArea = document.getElementById('text-area');
const excludeSpacesCheckbox = document.getElementById('exclude-spaces');
const setCharacterLimitCheckbox = document.getElementById('set-character-limit');

// Statistic display elements
const totalCharactersValue = document.getElementById('total-characters-value');
const wordCountValue = document.getElementById('word-count-value');
const sentenceCountValue = document.getElementById('sentence-count-value');
const readingTimeValue = document.getElementById('reading-time-value');

// Letter density and theme toggle
const letterDensityText = document.getElementById('letter-density-text');
const themeToggleButton = document.getElementById('theme-toggle');

/* ===================================
   EVENT LISTENERS
   =================================== */
// Update statistics on text input
textArea.addEventListener('input', updateStats);

// Update statistics when checkboxes change
excludeSpacesCheckbox.addEventListener('change', updateStats);
setCharacterLimitCheckbox.addEventListener('change', updateStats);
document.getElementById('character-limit-value').addEventListener('input', updateStats);

// Theme toggle functionality
themeToggleButton.addEventListener('click', () => {
    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
    } else {
        document.body.classList.add('dark-theme');
    }
    themeToggleButton.classList.toggle('dark-theme');
});

/* ===================================
   MAIN UPDATE FUNCTION
   =================================== */
function updateStats() {
    let text = textArea.value;
    let totalCharacters = text.length;

    // Handle "Exclude Spaces" option
    if (excludeSpacesCheckbox.checked) {
        totalCharacters = text.replace(/\s/g, '').length;
    }

    // Handle "Set Character Limit" option
    if (setCharacterLimitCheckbox.checked) {
        const characterLimitValueInput = document.querySelector('.character-limit-value');
        const limitWarning = document.getElementById('limit-warning');
        const characterLimitValueDisplay = document.getElementById('character-limit-value-display');
        
        // Display character limit value
        characterLimitValueDisplay.textContent = document.getElementById('character-limit-value').value;
        
        // Show warning if limit is reached
        if (totalCharacters >= parseInt(document.getElementById('character-limit-value').value, 10)) {
            limitWarning.style.display = 'flex';
            textArea.style.borderColor = 'red';
        } else {
            limitWarning.style.display = 'none';
            textArea.style.borderColor = '';
        }
        
        // Show character limit input field
        characterLimitValueInput.style.display = 'inline-block';
        
        // Enforce character limit by truncating text
        const characterLimitValue = document.getElementById('character-limit-value');
        const limit = parseInt(characterLimitValue.value, 10) || 0;
        
        if (totalCharacters > limit) {
            text = text.slice(0, limit);
            textArea.value = text;
            totalCharacters = limit;
        }
    } else {
        // Hide character limit input field when unchecked
        const characterLimitValueInput = document.querySelector('.character-limit-value');
        characterLimitValueInput.style.display = 'none';
    }

    // Calculate word count
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;

    // Calculate sentence count
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const sentenceCount = sentences.length;

    // Calculate reading time (200 words per minute)
    const totalMinutes = Math.ceil(wordCount / 200);

    // Format reading time
    let readingTimeText;
    if (totalMinutes === 0) {
        readingTimeText = '0 minute';
    } else if (totalMinutes < 60) {
        // Less than an hour - show minutes
        readingTimeText = `< 1 minutes`;
    } else {
        // More than an hour - show hours and minutes
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        readingTimeText = `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
    }

    // Update display values
    readingTimeValue.textContent = readingTimeText;
    totalCharactersValue.textContent = totalCharacters.toString().padStart(2, '0');
    wordCountValue.textContent = wordCount.toString().padStart(2, '0');
    sentenceCountValue.textContent = sentenceCount.toString().padStart(2, '0');

    // Update letter density statistics
    updateLetterDensity(text);
}

/* ===================================
   LETTER DENSITY CALCULATION
   =================================== */
function updateLetterDensity(text) {
    const letterCounts = {};
    const totalLetters = text.replace(/[^a-zA-Z]/g, '').length;
    const letterDensityStats = document.getElementById('letter-density-stats');
    const seeMoreBtn = document.getElementById('see-more-btn');

    // Count letters
    for (const char of text) {
        if (/[a-zA-Z]/.test(char)) {
            const lowerChar = char.toLowerCase();
            letterCounts[lowerChar] = (letterCounts[lowerChar] || 0) + 1;
        }
    }

    // Handle empty text case
    if (totalLetters === 0) {
        letterDensityStats.innerHTML = '<p class="no-data">No characters found. Start typing to see letter density.</p>';
        seeMoreBtn.style.display = 'none';
        return;
    }

    // Create array with letter data and calculate percentages
    const densityArray = [];
    for (const [char, count] of Object.entries(letterCounts)) {
        const percentage = ((count / totalLetters) * 100).toFixed(2);
        densityArray.push({
            char: char.toUpperCase(),
            count: count,
            percentage: parseFloat(percentage)
        });
    }

    // Sort by percentage (highest to lowest)
    densityArray.sort((a, b) => b.percentage - a.percentage);

    // Clear previous elements
    letterDensityStats.innerHTML = '';

    // Create elements for each letter
    densityArray.forEach((item, index) => {
        const statItem = document.createElement('div');
        statItem.className = 'stat-item';
        statItem.dataset.index = index;

        // Hide items after the first 5
        if (index >= 5) {
            statItem.classList.add('hidden');
        }

        statItem.innerHTML = `
            <span class="stat-label">${item.char}</span>
            <div class="progress-wrapper">
                <div class="progress-bar" style="width: ${item.percentage}%"></div>
            </div>
            <span class="stat-value">${item.count} (${item.percentage}%)</span>
        `;

        letterDensityStats.appendChild(statItem);
    });

    // Show "See more" button if there are more than 5 items
    if (densityArray.length > 5) {
        seeMoreBtn.style.display = 'inline-flex';
    } else {
        seeMoreBtn.style.display = 'none';
    }

    // Event handlers for "See more" and "See less" buttons
    seeMoreBtn.onclick = () => {
        document.querySelectorAll('.stat-item.hidden').forEach(item => item.classList.remove('hidden'));
        seeMoreBtn.style.display = 'none';
        document.getElementById('see-less-btn').style.display = 'inline-flex';
    };

    document.getElementById('see-less-btn').onclick = () => {
        document.querySelectorAll('.stat-item').forEach((item, index) => {
            if (index >= 5) {
                item.classList.add('hidden');
            }
        });
        seeMoreBtn.style.display = 'inline-flex';
        document.getElementById('see-less-btn').style.display = 'none';
    };
}

/* ===================================
   INITIALIZATION
   =================================== */
// Initialize statistics on page load
updateStats();