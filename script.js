// Function to get the selected language from either dropdown
function getSelectedLanguage() {
    const desktopSelect = document.getElementById("languageSelect");
    const mobileSelect = document.getElementById("mobileLanguageSelect");

    if (mobileSelect && mobileSelect.offsetParent !== null) {
        return mobileSelect.value; // Prioritize mobile select if it's visible
    }
    return desktopSelect ? desktopSelect.value : "en"; // Default to desktop or English
}

// Function to fetch translations using Google Translate API
async function fetchTranslations(textArray, targetLang) {
    const apiKey = "AIzaSyDatvVw9mWtSDF_b2SE0ZZJSqA6v5mdywg"; 
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: textArray, target: targetLang }),
        });

        const data = await response.json();
        if (data.error) {
            console.error("Translation API Error:", data.error.message);
            return [];
        }

        return data.data.translations.map(t => t.translatedText);
    } catch (error) {
        console.error("Error fetching translations:", error);
        return [];
    }
}

// Utility function to get text content safely
function getTextContentBySelector(selector) {
    const element = document.querySelector(selector);
    return element ? element.textContent.trim() : '';
}

// Function to translate page content
async function translateContent() {
    const selectedLang = getSelectedLanguage();
    
    // Collect text elements to translate
    const textElements = [
        { selector: "#home h1", text: getTextContentBySelector("#home h1") },
        { selector: "#home p", text: getTextContentBySelector("#home p") },
        { selector: "#about h2", text: getTextContentBySelector("#about h2") },
        { selector: "#about p", text: getTextContentBySelector("#about p") },
        { selector: "#products h2", text: getTextContentBySelector("#products h2") },
        { selector: "#gallery h2", text: getTextContentBySelector("#gallery h2") },
        { selector: "#payments h2", text: getTextContentBySelector("#payments h2") },
        { selector: "#payments p", text: getTextContentBySelector("#payments p") },
        { selector: "#contact h2", text: getTextContentBySelector("#contact h2") },
        { selector: "#map-content", text: getTextContentBySelector("#map-content") },
        { selector: "#payments-header", text: getTextContentBySelector("#payments-header") },
        { selector: "#payment-description", text: getTextContentBySelector("#payment-description") },
        { selector: "#basic-plan-title", text: getTextContentBySelector("#basic-plan-title") },
        { selector: "#basic-plan-description", text: getTextContentBySelector("#basic-plan-description") },
        { selector: "#basic-ul", text: getTextContentBySelector("#basic-ul") },
        { selector: "#basic-price", text: getTextContentBySelector("#basic-price") },
        { selector: "#pro-plan-title", text: getTextContentBySelector("#pro-plan-title") },
        { selector: "#pro-plan-description", text: getTextContentBySelector("#pro-plan-description") },
        { selector: "#pro-ul", text: getTextContentBySelector("#pro-ul") },
        { selector: "#pro-price", text: getTextContentBySelector("#pro-price") },
        { selector: "#premium-plan-title", text: getTextContentBySelector("#premium-plan-title") },
        { selector: "#premium-plan-description", text: getTextContentBySelector("#premium-plan-description") },
        { selector: "#premium-ul", text: getTextContentBySelector("#premium-ul") },
        { selector: "#premium-price", text: getTextContentBySelector("#premium-price") },
    ];
    // Collect filter button texts (for product categories)
    const filterButtonTexts = Array.from(document.querySelectorAll(".filter-btn")).map((el) => ({
        selector: null, 
        text: el.textContent.trim(),
        element: el,
    }));
    textElements.push(...filterButtonTexts);

    // Collect category descriptions (like 'Tag: Plants', 'Tag: Seeds', etc.)
    const productCategoryTags = Array.from(document.querySelectorAll(".filter-item .p-4 p")).map((el) => ({
        selector: null, 
        text: el.textContent.trim(),
        element: el,
    }));
    textElements.push(...productCategoryTags);


    // Add all product descriptions
    const productDescriptions = Array.from(document.querySelectorAll(".product-card p")).map((el, index) => ({
        selector: `.product-card:nth-child(${index + 1}) p`,
        text: el.textContent.trim(),
    }));
    textElements.push(...productDescriptions);

    // Add navigation items
    const navItems = Array.from(document.querySelectorAll(".nav-link")).map(el => ({
        selector: null, 
        text: el.textContent.trim(),
        element: el, 
    }));
    textElements.push(...navItems);

    // Translate the text elements
    const textsToTranslate = textElements.map(el => el.text);
    const translatedTexts = await fetchTranslations(textsToTranslate, selectedLang);

    // Apply translations
    textElements.forEach((el, index) => {
        const translatedText = translatedTexts[index] || el.text;
        if (el.selector) {
            const element = document.querySelector(el.selector);
            if (element) element.textContent = translatedText;
        } else if (el.element) {
            el.element.textContent = translatedText;
        }
    });

    // Translate specific contact details
    const contactDetailsSelectors = ["#contact-address", "#contact-days", "#contact-hours"];
    const contactDetailsTexts = contactDetailsSelectors.map(selector =>
        getTextContentBySelector(selector)
    );
    const translatedContactDetails = await fetchTranslations(contactDetailsTexts, selectedLang);

    contactDetailsSelectors.forEach((selector, index) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = translatedContactDetails[index] || element.textContent;
    });
}

// Ensure event listeners attach properly, even if elements load dynamically
function setupLanguageDropdownListeners() {
    const desktopSelect = document.getElementById("languageSelect");
    const mobileSelect = document.getElementById("mobileLanguageSelect");

    if (desktopSelect) desktopSelect.addEventListener("change", translateContent);
    if (mobileSelect) mobileSelect.addEventListener("change", translateContent);
}

// Initialize content translation on page load
window.onload = () => {
    setupLanguageDropdownListeners();
    translateContent(); 
};

// Ensure translation runs after mobile menu is opened
document.getElementById("menu-toggle")?.addEventListener("click", () => {
    setTimeout(() => {
        setupLanguageDropdownListeners(); // Reattach listeners in case mobile menu was hidden
    }, 100);
});

// Dynamically set the current year in the footer
document.getElementById("currentYear").textContent = new Date().getFullYear();
