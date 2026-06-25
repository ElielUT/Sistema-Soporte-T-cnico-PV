document.addEventListener("DOMContentLoaded", () => {
    // Initialize searchable select elements dynamically
    document.querySelectorAll("select[data-searchable='true']").forEach(select => {
        initSearchableSelect(select);
    });
});

function initSearchableSelect(select) {
    if (select.dataset.searchableInitialized) return;
    select.dataset.searchableInitialized = "true";

    // Create container
    const container = document.createElement("div");
    container.className = "searchable-select-container";
    
    // Copy the class list of the select to the container if needed
    if (select.className) {
        container.className += " " + select.className;
    }
    
    // Hide original select
    select.style.display = "none";
    
    // Insert container before the select and move select inside the container (so it stays in the form structure)
    select.parentNode.insertBefore(container, select);
    container.appendChild(select);

    // Create search input
    const input = document.createElement("input");
    input.type = "text";
    input.className = "searchable-select-input";
    input.placeholder = select.options[0]?.text || "Seleccione...";
    input.autocomplete = "off";
    container.appendChild(input);

    // Create dropdown menu
    const dropdown = document.createElement("div");
    dropdown.className = "searchable-select-dropdown ocultar";
    container.appendChild(dropdown);

    let focusedOptionIndex = -1;

    // Helper to update the input's displayed value based on current select value
    function updateInputValue() {
        const selectedOption = select.options[select.selectedIndex];
        if (selectedOption && select.value !== "") {
            input.value = selectedOption.text.trim();
        } else {
            input.value = "";
            input.placeholder = select.options[0]?.text || "Seleccione...";
        }
    }

    // Populate dropdown options
    function populateDropdown() {
        dropdown.innerHTML = "";
        const query = input.value.trim().toLowerCase();
        
        let matchCount = 0;
        Array.from(select.options).forEach((option, index) => {
            // Skip the default disabled placeholder option
            if (option.disabled && option.value === "") return;

            const text = option.text;
            if (query && !text.toLowerCase().includes(query)) return;

            matchCount++;
            const optDiv = document.createElement("div");
            optDiv.className = "searchable-select-option";
            if (select.value === option.value) {
                optDiv.classList.add("selected");
            }
            optDiv.textContent = text;
            optDiv.dataset.value = option.value;
            optDiv.dataset.index = index;

            optDiv.addEventListener("click", () => {
                select.value = option.value;
                // Dispatch change/input events so other listeners (like form.js) detect the change
                select.dispatchEvent(new Event('input', { bubbles: true }));
                select.dispatchEvent(new Event('change', { bubbles: true }));
                closeDropdown();
            });

            dropdown.appendChild(optDiv);
        });

        if (matchCount === 0) {
            const noMatchDiv = document.createElement("div");
            noMatchDiv.className = "searchable-select-option";
            noMatchDiv.style.cursor = "default";
            noMatchDiv.style.color = "var(--colorBlack50)";
            noMatchDiv.textContent = "No se encontraron resultados";
            dropdown.appendChild(noMatchDiv);
        }
    }

    function openDropdown() {
        // Only clear if the current value matches the selected text exactly (to allow searching)
        const selectedOption = select.options[select.selectedIndex];
        if (selectedOption && input.value.trim() === selectedOption.text.trim()) {
            input.value = ""; // clear to show all options, but keep placeholder
        }
        populateDropdown();
        dropdown.classList.remove("ocultar");
        focusedOptionIndex = -1;
    }

    function closeDropdown() {
        dropdown.classList.add("ocultar");
        updateInputValue();
    }

    // Toggle dropdown on input click
    input.addEventListener("click", (e) => {
        e.stopPropagation();
        if (dropdown.classList.contains("ocultar")) {
            openDropdown();
        } else {
            closeDropdown();
        }
    });

    // Filter options on typing
    input.addEventListener("input", () => {
        if (dropdown.classList.contains("ocultar")) {
            openDropdown();
        } else {
            populateDropdown();
        }
    });

    // Keyboard navigation
    input.addEventListener("keydown", (e) => {
        const optionElements = dropdown.querySelectorAll(".searchable-select-option:not([style*='cursor: default'])");
        
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (dropdown.classList.contains("ocultar")) {
                openDropdown();
                return;
            }
            if (optionElements.length === 0) return;
            
            if (focusedOptionIndex >= 0 && optionElements[focusedOptionIndex]) {
                optionElements[focusedOptionIndex].classList.remove("focus");
            }
            focusedOptionIndex = (focusedOptionIndex + 1) % optionElements.length;
            optionElements[focusedOptionIndex].classList.add("focus");
            optionElements[focusedOptionIndex].scrollIntoView({ block: "nearest" });
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (dropdown.classList.contains("ocultar")) return;
            if (optionElements.length === 0) return;

            if (focusedOptionIndex >= 0 && optionElements[focusedOptionIndex]) {
                optionElements[focusedOptionIndex].classList.remove("focus");
            }
            focusedOptionIndex = (focusedOptionIndex - 1 + optionElements.length) % optionElements.length;
            optionElements[focusedOptionIndex].classList.add("focus");
            optionElements[focusedOptionIndex].scrollIntoView({ block: "nearest" });
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (dropdown.classList.contains("ocultar")) return;
            
            if (focusedOptionIndex >= 0 && optionElements[focusedOptionIndex]) {
                optionElements[focusedOptionIndex].click();
            } else if (optionElements.length > 0) {
                // If enter pressed without arrowing, select the first match
                optionElements[0].click();
            }
        } else if (e.key === "Escape") {
            closeDropdown();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!container.contains(e.target)) {
            closeDropdown();
        }
    });

    // Listen for external value changes on original select
    select.addEventListener("change", () => {
        updateInputValue();
    });

    // Initial value setup
    updateInputValue();
}
