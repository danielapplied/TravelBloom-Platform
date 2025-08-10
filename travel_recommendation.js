document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const clearBtn = document.getElementById('clear-btn');
    const searchResults = document.getElementById('search-results');
    const errorMessage = document.getElementById('error-message');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    // Navigation functionality
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            // Hide all pages
            pages.forEach(page => {
                page.classList.add('hidden');
            });
            
            // Show target page
            document.getElementById(targetPage).classList.remove('hidden');
            
            // Show/hide search container based on page
            const searchContainer = document.querySelector('.search-container');
            if (targetPage === 'home') {
                searchContainer.style.display = 'flex';
            } else {
                searchContainer.style.display = 'none';
            }
        });
    });

    // Fetch travel data
    async function fetchTravelData() {
        try {
            const response = await fetch('travel_recommendation_api.json');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching travel data:', error);
            return null;
        }
    }

    // Search functionality
    searchBtn.addEventListener('click', async function() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (!searchTerm) {
            errorMessage.classList.remove('hidden');
            searchResults.innerHTML = '';
            return;
        }
        
        errorMessage.classList.add('hidden');
        
        const travelData = await fetchTravelData();
        if (!travelData) {
            errorMessage.textContent = 'Failed to load travel data. Please try again later.';
            errorMessage.classList.remove('hidden');
            return;
        }
        
        // Filter results based on search term
        let results = [];
        
        if (searchTerm.includes('beach') || searchTerm.includes('beaches')) {
            results = travelData.filter(item => 
                item.type.toLowerCase() === 'beach' || 
                item.description.toLowerCase().includes('beach')
            );
        } else if (searchTerm.includes('temple') || searchTerm.includes('temples')) {
            results = travelData.filter(item => 
                item.type.toLowerCase() === 'temple' || 
                item.description.toLowerCase().includes('temple')
            );
        } else if (searchTerm.includes('country') || searchTerm.includes('countries')) {
            results = travelData.filter(item => 
                item.type.toLowerCase() === 'country' || 
                item.description.toLowerCase().includes('country')
            );
        } else {
            // General search across all fields
            results = travelData.filter(item => 
                item.name.toLowerCase().includes(searchTerm) || 
                item.description.toLowerCase().includes(searchTerm) || 
                item.location.toLowerCase().includes(searchTerm)
            );
        }
        displayResults(results);
    });

    // Display search results
    function displayResults(results) {
        searchResults.innerHTML = '';
        
        if (results.length === 0) {
            searchResults.innerHTML = '<p>No results found. Try a different search term.</p>';
            return;
        }
        
        results.forEach(result => {
            const card = document.createElement('div');
            card.className = 'result-card';
            
            // Get local time for the location
            let localTime = '';
            try {
                const options = { 
                    timeZone: result.timezone || 'UTC', 
                    hour12: true, 
                    hour: 'numeric', 
                    minute: 'numeric' 
                };
                localTime = new Date().toLocaleTimeString('en-US', options);
            } catch (error) {
                localTime = 'Time information not available';
            }
            
            card.innerHTML = `
                <img loading="lazy" as="image" src="${result.imageUrl}" alt="${result.name}">
                <div class="result-info">
                    <h3>${result.name}</h3>
                    <p>${result.description}</p>
                    <p><strong>Location:</strong> ${result.location}</p>
                    <p class="time"><strong>Local Time:</strong> ${localTime}</p>
                    <button class="visit-now">Visit Now</button>
                </div>
            `;
            
            searchResults.appendChild(card);
        });
    }

    // Clear functionality
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        searchResults.innerHTML = '';
        errorMessage.classList.add('hidden');
    });

    // Initialize the app with home page visible
    function init() {
        // Show home page by default
        pages.forEach(page => {
            if (page.id !== 'home') {
                page.classList.add('hidden');
            }
        });
    }

    init();
});
