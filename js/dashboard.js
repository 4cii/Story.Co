       // Tiap halaman: judul, subjudul, dan status cerita yang ditampilkan
        const pages = {
            'overview':          { title: 'Greetings, Kharim.', subtitle: "Today's view",                  show: ['waiting', 'attention'] },
            'delete-stories':    { title: 'Delete Stories',     subtitle: 'Stories removed from the board', show: ['deleted'] },
            'published-stories': { title: 'Published Stories',  subtitle: 'Stories live on the board',      show: ['published'] },
            'urgent-cases':      { title: 'Urgent Cases',       subtitle: 'Stories that need attention',    show: ['attention'] }
        };

        // Teks & warna badge untuk tiap status
        const badges = {
            waiting:   ['Waiting',         'badge-waiting'],
            published: ['Published',       'badge-published'],
            attention: ['Needs attention', 'badge-attention'],
            deleted:   ['Deleted',         'badge-deleted']
        };

        const stories = document.querySelectorAll('.story');
        const moodSelect = document.querySelector('.category');
        const searchInput = document.querySelector('.search input');

        // Tampilkan halaman sesuai #hash
        function showPage() {
            const name = location.hash.slice(1) in pages ? location.hash.slice(1) : 'overview';
            const page = pages[name];

            document.getElementById('title').textContent = page.title;
            document.getElementById('subtitle').textContent = page.subtitle;
            document.getElementById('stats').style.display = name === 'overview' ? '' : 'none';

            document.querySelectorAll('.menu a').forEach((a) => {
                a.classList.toggle('active', a.getAttribute('href') === '#' + name);
            });

            filterStories();
        }

        // Sembunyikan cerita yang tidak cocok dengan halaman, mood, dan kata kunci
        function filterStories() {
            const page = pages[location.hash.slice(1)] || pages['overview'];
            const mood = moodSelect.value;
            const keyword = searchInput.value.trim().toLowerCase();

            stories.forEach((story) => {
                const statusMatch = page.show.includes(story.dataset.status);
                const moodMatch = mood === 'all' || story.dataset.mood === mood;
                const textMatch = story.querySelector('.story-text').textContent.toLowerCase().includes(keyword);
                story.hidden = !(statusMatch && moodMatch && textMatch);
            });

            // update angka di kartu statistik
            for (const status of ['waiting', 'published', 'attention']) {
                document.getElementById('count-' + status).textContent =
                    document.querySelectorAll('.story[data-status="' + status + '"]').length;
            }
        }

        // Klik tombol Action & pilihan di menunya
        document.querySelector('.list').addEventListener('click', (e) => {
            const story = e.target.closest('.story');
            if (!story) return;

            // klik tombol Action: buka / tutup menu
            if (e.target.closest('.action-btn')) {
                const wasOpen = story.classList.contains('open');
                document.querySelectorAll('.story.open').forEach((s) => s.classList.remove('open'));
                if (!wasOpen) story.classList.add('open');
            }

            // klik pilihan status: ubah status + badge, lalu pindah halaman otomatis
            const option = e.target.closest('.option');
            if (option) {
                const status = option.dataset.status;
                const badge = story.querySelector('.badge');
                story.dataset.status = status;
                badge.textContent = badges[status][0];
                badge.className = 'badge ' + badges[status][1];
                story.classList.remove('open');
                filterStories();
            }
        });

        moodSelect.addEventListener('change', filterStories);
        searchInput.addEventListener('input', filterStories);
        window.addEventListener('hashchange', showPage);
        showPage();

        document.addEventListener('click', (e) => {
    if (!e.target.closest('.story')) {
        document.querySelectorAll('.story.open').forEach((s) => s.classList.remove('open'));
    }
});