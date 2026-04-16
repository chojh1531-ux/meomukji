// Mock Data for the Recommendation Engine

const RESTAURANTS = [
    {
        id: 1,
        name: "화화돼지왕갈비",
        category: "한식",
        img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        rating: 4.8,
        price: "$$",
        tags: ["저녁 회식", "고기"],
        allergens: []
    },
    {
        id: 2,
        name: "정돈 프리미엄",
        category: "일식",
        img: "https://images.unsplash.com/photo-1596797038530-2c107229654b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        rating: 4.7,
        price: "$$",
        tags: ["점심 식사", "돈까스"],
        allergens: ["돼지고기"]
    },
    {
        id: 3,
        name: "도마 29",
        category: "일식",
        img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        rating: 4.9,
        price: "$$$",
        tags: ["미팅/접대", "초밥"],
        allergens: ["해산물", "생선"]
    },
    {
        id: 4,
        name: "마라공방",
        category: "중식",
        img: "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        rating: 4.5,
        price: "$",
        tags: ["점심 식사", "매운맛"],
        allergens: ["땅콩"]
    },
    {
        id: 5,
        name: "피자네버슬립스",
        category: "양식",
        img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        rating: 4.6,
        price: "$$",
        tags: ["점심 식사", "피자", "저녁 회식"],
        allergens: ["밀가루", "유제품"]
    },
    {
        id: 6,
        name: "샐러디",
        category: "기타",
        img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        rating: 4.4,
        price: "$",
        tags: ["점심 식사", "비건", "다이어트"],
        allergens: []
    }
];

const MOCK_PROFILES = {
    "김매니저": { name: "김매니저", level: 3, pref: ["한식", "중식"], dislike: ["양식"], allergies: [] },
    "박시니어": { name: "박시니어", level: 4, pref: ["일식", "양식"], dislike: [], allergies: ["땅콩"] },
    "이어소시": { name: "이어소시", level: 2, pref: ["중식", "기타"], dislike: ["일식"], allergies: [] },
    "최임원": { name: "최임원", level: 5, pref: ["일식", "한식"], dislike: ["중식"], allergies: [] },
};

function getWeightByLevel(level) {
    switch(parseInt(level)) {
        case 5: return 3.0;
        case 4: return 2.0;
        case 3: return 1.5;
        default: return 1.0;
    }
}

function recommend(currentUser, members, purposeList) {
    let allMembers = [currentUser, ...members.map(name => MOCK_PROFILES[name])].filter(Boolean);
    
    // 1. Hard Filter (Allergies)
    let combinedAllergies = [];
    allMembers.forEach(mem => {
        if(mem.allergies && mem.allergies.length > 0) {
            combinedAllergies = [...combinedAllergies, ...mem.allergies];
        }
    });

    let availableRestaurants = RESTAURANTS.filter(r => {
        return !r.allergens.some(a => combinedAllergies.includes(a));
    });

    // 2. Score calculation
    availableRestaurants.forEach(r => {
        r.score = 0;
        r.reasonLog = [];
        let highestLevelPref = 0;
        let highestLevelName = "";
        
        allMembers.forEach(mem => {
            let weight = getWeightByLevel(mem.level);
            
            if (mem.pref && mem.pref.includes(r.category)) {
                r.score += 10 * weight;
                if (mem.level > highestLevelPref) {
                    highestLevelPref = mem.level;
                    highestLevelName = mem.name;
                }
            }
            if (mem.dislike && mem.dislike.includes(r.category)) {
                r.score -= 5 * weight;
            }
        });
        
        if (highestLevelPref >= 4 && highestLevelName !== currentUser.name) {
             r.reasonLog.push(`${highestLevelName}님이 선호하는 ${r.category} 식당입니다!`);
        } else if (highestLevelPref === currentUser.level) {
             r.reasonLog.push(`내 취향에 딱 맞는 ${r.category} 요리!`);
        }
        
        // Add random slight variation to break ties naturally
        r.score += Math.random();
    });

    // Sort by score descending
    availableRestaurants.sort((a, b) => b.score - a.score);
    
    return availableRestaurants.slice(0, 3);
}

window.RecommendationEngine = {
    recommend,
    MOCK_PROFILES
};
