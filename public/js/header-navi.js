function toggleMegaMenu(triggerId, menuId, otherTriggerId, otherMenuId) {
    const trigger = document.getElementById(triggerId);
    const menu = document.getElementById(menuId);
    const otherTrigger = document.getElementById(otherTriggerId);
    const otherMenu = document.getElementById(otherMenuId);
  
    // 閉じる処理（他方）
    if (otherMenu.classList.contains('show')) {
      otherMenu.classList.remove('show');
      otherTrigger.classList.remove('active');
    }
  
    // toggle自身
    if (menu.classList.contains('show')) {
      menu.classList.remove('show');
      trigger.classList.remove('active');
    } else {
      menu.classList.add('show');
      trigger.classList.add('active');
    }
}
  
document.getElementById('categoryView').addEventListener('click', function (e) {
    e.stopPropagation();
    toggleMegaMenu('categoryView', 'categoryViewMenu', 'references', 'referencesMenu');
});

document.getElementById('references').addEventListener('click', function (e) {
    e.stopPropagation();
    toggleMegaMenu('references', 'referencesMenu', 'categoryView', 'categoryViewMenu');
    });

    // クリック外で閉じる
    document.addEventListener('click', function (event) {
    ['categoryViewMenu', 'referencesMenu'].forEach(menuId => {
        const menu = document.getElementById(menuId);
        if (menu.classList.contains('show')) {
        menu.classList.remove('show');
        }
    });

    ['categoryView', 'references'].forEach(id => {
        document.getElementById(id).classList.remove('active');
    });
});

// 検索機能の実装
document.addEventListener('DOMContentLoaded', function() {
    const searchToggle = document.getElementById('searchToggle');
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const closeSearch = document.getElementById('closeSearch');
    
    // 検索ボタンクリック時
    searchToggle.addEventListener('click', function() {
      searchForm.classList.add('active');
      searchInput.focus(); // 自動的にフォーカスを当てる
    });
    
    // 閉じるボタンクリック時
    closeSearch.addEventListener('click', function() {
      searchForm.classList.remove('active');
    });
    
    // ESCキーを押した時に検索窓を閉じる
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && searchForm.classList.contains('active')) {
        searchForm.classList.remove('active');
      }
    });
    
    // 検索窓の外側をクリックした時に閉じる
    document.addEventListener('click', function(e) {
      const isClickInside = searchForm.contains(e.target) || searchToggle.contains(e.target);
      
      if (!isClickInside && searchForm.classList.contains('active')) {
        searchForm.classList.remove('active');
      }
    });
  });