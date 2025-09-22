// Category to Focus Area Mapping
// Based on the provided mapping table

const categoryToFocusAreaMap = {
  // Direct matches
  "Agri inputs": ["agri-inputs"],
  "Post Harvest and Food Technology": ["post-harvest"],
  "Livestock medicines and nutrients": ["animal-husbandry"],
  "Natural Resource Management": ["resource-management"],
  "Secondary Agriculture": ["waste-management"],
  
  // Multiple focus areas
  "Farm machinery and implements": ["machinery", "mechanization"],
  "Food processing and technology": ["post-harvest"],
  "IoT and App (Precision agriculture)": ["precision-farming", "ict-agriculture"],
  
  // Additional mappings for common variations
  "Agricultural Machinery": ["machinery", "mechanization"],
  "Farm Mechanization": ["machinery", "mechanization"],
  "Precision Agriculture": ["precision-farming", "ict-agriculture"],
  "Smart Agriculture": ["precision-farming", "ict-agriculture"],
  "IoT Agriculture": ["precision-farming", "ict-agriculture"],
  "Food Technology": ["post-harvest"],
  "Post Harvest Technology": ["post-harvest"],
  "Animal Husbandry": ["animal-husbandry"],
  "Livestock Management": ["animal-husbandry"],
  "Dairy Technology": ["animal-husbandry"],
  "Waste Management": ["waste-management"],
  "Waste to Wealth": ["waste-management"],
  "Resource Management": ["resource-management"],
  "Soil Management": ["resource-management"],
  "Water Management": ["resource-management"],
  "Environmental Conservation": ["resource-management"],
  "Organic Farming": ["organic-farming"],
  "Biotechnology": ["biotechnology"],
  "Agricultural Biotechnology": ["biotechnology"],
  "Agri Education": ["agri-education"],
  "Extension Education": ["agri-education"],
  "Health Services": ["health-services"],
  "Plant Health": ["health-services"],
  "Supply Chain": ["supply-chain"],
  "Logistics": ["supply-chain"],
  "Agricultural Supply Chain": ["supply-chain"]
};

// Category-specific icons to avoid repetition
const categoryIcons = {
  "Agri inputs": "🌱",
  "Post Harvest and Food Technology": "🏭",
  "Food processing and technology": "🍽️",
  "Farm machinery and implements": "🚜",
  "IoT and App (Precision agriculture)": "📡",
  "Livestock medicines and nutrients": "🐄",
  "Natural Resource Management": "🌍",
  "Secondary Agriculture": "♻️",
  "Waste to Wealth": "💰",
  "Agricultural Machinery": "🚜",
  "Farm Mechanization": "🔧",
  "Precision Agriculture": "📡",
  "Smart Agriculture": "🤖",
  "IoT Agriculture": "📡",
  "Food Technology": "🍽️",
  "Post Harvest Technology": "🏭",
  "Animal Husbandry": "🐄",
  "Livestock Management": "🐄",
  "Dairy Technology": "🥛",
  "Waste Management": "♻️",
  "Resource Management": "🌍",
  "Soil Management": "🌱",
  "Water Management": "💧",
  "Environmental Conservation": "🌿",
  "Organic Farming": "🌿",
  "Biotechnology": "🧬",
  "Agricultural Biotechnology": "🧬",
  "Agri Education": "🎓",
  "Extension Education": "🎓",
  "Health Services": "🏥",
  "Plant Health": "🌿",
  "Supply Chain": "⚙️",
  "Logistics": "🚚",
  "Agricultural Supply Chain": "⚙️"
};

// Focus area details with icons
const focusAreaDetails = {
  "agri-inputs": { icon: "🌱", title: "Agri Inputs" },
  "post-harvest": { icon: "🏭", title: "Post Harvest and Food Technology" },
  "animal-husbandry": { icon: "🐄", title: "Animal Husbandry & Dairying" },
  "agri-education": { icon: "🎓", title: "Agri Extension Education" },
  "precision-farming": { icon: "📡", title: "Precision Farming" },
  "machinery": { icon: "🚜", title: "Agricultural Machinery" },
  "health-services": { icon: "🏥", title: "Agri Clinics & Farm Health Services" },
  "waste-management": { icon: "♻️", title: "Waste to Wealth, Secondary Agriculture" },
  "supply-chain": { icon: "⚙️", title: "Agricultural Supply Chain" },
  "ict-agriculture": { icon: "🤖", title: "IoT, ICT in Agriculture" },
  "mechanization": { icon: "🔧", title: "Farm Mechanisation" },
  "organic-farming": { icon: "🌿", title: "Organic Farming" },
  "biotechnology": { icon: "🧬", title: "Agricultural Biotechnology" },
  "resource-management": { icon: "🌍", title: "Natural Resource Management" },
  "other": { icon: "➕", title: "Any Other" }
};

/**
 * Maps a product category to focus areas
 * @param {string} category - The product category
 * @returns {Array} Array of focus area objects with id, icon, and title
 */
function mapCategoryToFocusAreas(category) {
  if (!category) return [];
  
  // Normalize category name (trim, lowercase for comparison)
  const normalizedCategory = category.trim();
  
  // Direct lookup
  const focusAreaIds = categoryToFocusAreaMap[normalizedCategory];
  
  if (focusAreaIds) {
    return focusAreaIds.map(id => ({
      id,
      icon: focusAreaDetails[id]?.icon || "📦",
      title: focusAreaDetails[id]?.title || id
    }));
  }
  
  // Fuzzy matching for partial matches
  const lowerCategory = normalizedCategory.toLowerCase();
  
  for (const [key, focusAreaIds] of Object.entries(categoryToFocusAreaMap)) {
    const lowerKey = key.toLowerCase();
    
    // Check if category contains key words or vice versa
    if (lowerCategory.includes(lowerKey) || lowerKey.includes(lowerCategory)) {
      return focusAreaIds.map(id => ({
        id,
        icon: focusAreaDetails[id]?.icon || "📦",
        title: focusAreaDetails[id]?.title || id
      }));
    }
  }
  
  // Default fallback
  return [{
    id: "other",
    icon: "➕",
    title: "Any Other"
  }];
}

/**
 * Gets the primary focus area for a category (first match)
 * @param {string} category - The product category
 * @returns {Object} Primary focus area object
 */
function getPrimaryFocusArea(category) {
  const focusAreas = mapCategoryToFocusAreas(category);
  const primaryFocusArea = focusAreas[0] || { id: "other", icon: "➕", title: "Any Other" };
  
  // Use category-specific icon if available
  const categoryIcon = categoryIcons[category];
  if (categoryIcon) {
    return {
      ...primaryFocusArea,
      icon: categoryIcon
    };
  }
  
  return primaryFocusArea;
}

/**
 * Gets all focus area details
 * @returns {Object} All focus area details
 */
function getAllFocusAreaDetails() {
  return focusAreaDetails;
}

export {
  mapCategoryToFocusAreas,
  getPrimaryFocusArea,
  getAllFocusAreaDetails,
  categoryToFocusAreaMap,
  focusAreaDetails,
  categoryIcons
};
