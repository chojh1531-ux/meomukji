const app = {
    currentUser: {
        name: "",
        level: 1,
        allergies: []
    },
    selectedMembers: [],

    init() {
        this.bindEvents();
    },

    bindEvents() {
        // Level Selector
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.currentUser.level = parseInt(e.currentTarget.dataset.level);
            });
        });

        // Start Button
        document.getElementById('start-btn').addEventListener('click', () => {
            const name = document.getElementById('user-name').value.trim();
            const allergies = document.getElementById('user-allergies').value
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);
            
            if(!name) {
                alert("이름을 입력해주세요!");
                return;
            }
            if(!this.currentUser.level) {
                document.querySelector('.level-btn[data-level="1"]').classList.add('selected');
                this.currentUser.level = 1;
            }

            this.currentUser.name = name;
            this.currentUser.allergies = allergies;
            this.currentUser.pref = ["한식", "일식", "양식", "중식"]; // Default
            
            document.getElementById('display-name').textContent = name;
            
            // Add user to chip list in filter screen
            this.updateMemberList();
            this.navigate('home-screen');
        });

        // Navigation
        document.getElementById('btn-quick-curation').addEventListener('click', () => {
            this.runRecommendation(true);
        });

        document.getElementById('btn-detailed-filter').addEventListener('click', () => {
            this.navigate('filter-screen');
        });
        
        // Chip toggle
        document.querySelectorAll('.toggle-group .chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const parentGroup = e.target.closest('.toggle-group');
                parentGroup.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Member Selection
        document.getElementById('member-select').addEventListener('change', (e) => {
            if(e.target.value) {
                if(!this.selectedMembers.includes(e.target.value)) {
                    this.selectedMembers.push(e.target.value);
                    this.updateMemberList();
                }
                e.target.value = "";
            }
        });

        // Find Menu
        document.getElementById('find-menu-btn').addEventListener('click', () => {
            this.runRecommendation(false);
        });
    },

    navigate(screenId) {
        document.querySelectorAll('.screen').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });
        const target = document.getElementById(screenId);
        target.style.display = 'block';
        setTimeout(() => {
            target.classList.add('active');
        }, 10);
    },

    updateMemberList() {
        const container = document.getElementById('member-list');
        container.innerHTML = `<div class="chip active">${this.currentUser.name} (나)</div>`;
        this.selectedMembers.forEach(mem => {
            const memberObj = window.RecommendationEngine.MOCK_PROFILES[mem];
            const levelLabel = memberObj ? `(Level ${memberObj.level})` : '';
            container.innerHTML += `
                <div class="chip" onclick="app.removeMember('${mem}')">
                    ${mem} ${levelLabel} <i class="fas fa-times" style="font-size:12px; margin-left:6px; color:#6C757D;"></i>
                </div>
            `;
        });
    },

    removeMember(name) {
        this.selectedMembers = this.selectedMembers.filter(m => m !== name);
        this.updateMemberList();
    },

    runRecommendation(isQuick) {
        let members = isQuick ? [] : this.selectedMembers;
        let results = window.RecommendationEngine.recommend(this.currentUser, members, []);
        
        this.renderResults(results);
        this.navigate('result-screen');
    },

    renderResults(results) {
        const container = document.getElementById('result-container');
        container.innerHTML = "";

        if (results.length === 0) {
            container.innerHTML = `<div class="card"><p style="text-align:center;color:#666;">조건에 맞는 식당이 없습니다.</p></div>`;
            return;
        }

        results.forEach((r, idx) => {
            let topReason = r.reasonLog.length > 0 ? r.reasonLog[0] : "최적의 평점과 분위기를 가진 추천 식당입니다!";
            if (idx === 0 && this.selectedMembers.length === 0) topReason = "내 프로필 기반 가장 최적의 추천 픽!";

            container.innerHTML += `
                <div class="card result-card">
                    <div class="result-img-wrapper">
                        <span class="rank-badge">${idx + 1}</span>
                        <img src="${r.img}" class="result-img" alt="${r.name}">
                    </div>
                    <div class="result-info">
                        <div class="result-meta">
                            <span class="result-category">${r.category}</span>
                            <span class="result-rating"><i class="fas fa-star"></i> ${r.rating}</span>
                        </div>
                        <h3 class="result-title">${r.name}</h3>
                        <div class="result-reason">
                            <i class="fas fa-magic" style="color:var(--primary); margin-right:6px;"></i> 
                            ${topReason}
                        </div>
                        <div class="result-footer">
                            <button class="detail-btn">상세보기</button>
                            <button class="map-btn"><i class="fas fa-map-marker-alt"></i></button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
};

window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
