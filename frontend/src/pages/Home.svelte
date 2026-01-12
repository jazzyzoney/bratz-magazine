<script>
    import { onMount } from 'svelte';
    import { currentPostId, currentPage } from '../stores/pageStore.js';
    import { marked } from 'marked'

    let blogs = []
    let latestIssue = null
    let isLoading = true

    onMount(async () => {
        try {
            const [blogsRes, issuesRes] = await Promise.all([
                fetch('http://localhost:8080/api/blogs?status=published'),
                fetch('http://localhost:8080/api/issues')
            ])

            const blogsData = await blogsRes.json()
            const issuesData = await issuesRes.json()
            
            // latest 3 blogs
            blogs = (blogsData.data || []).slice(0, 3)
            
            // the newest issue
            if (issuesData.data && issuesData.data.length > 0) {
                latestIssue = issuesData.data[0]
            }

        } catch (error) {
            console.error("Error loading home data:", error)
        } finally {
            isLoading = false
        }
    })

    function openPost(id) {
        $currentPostId = id
        $currentPage = 'blog'
    }

    function goToIssues() {
        $currentPage = 'issues'
    }
</script>

<div class="home-container">
    
    <section class="hero">
        <h1>Stilesville's Hottest Forum</h1>
        <p class="tagline">The ultimate destination for passion, fashion, and friends.</p>
    </section>

    <section class="intro-grid">
        <div class="intro-card">
            <h3>👑 Who We Are</h3>
            <p>We are the <strong>Bratz Pack</strong>—Cloe, Jade, Sasha, and Yasmin. We created this magazine to express ourselves, share the hottest trends, and help you find your own unique sparkle.</p>
        </div>
        <div class="intro-card">
            <h3>✨ What We Offer</h3>
            <p>Check out our <strong>Corners</strong> for personal updates, ask for advice in <strong>Style SOS</strong>, or read our full monthly <strong>Issues</strong></p>
        </div>
    </section>

    {#if latestIssue}
    <section class="issue-spotlight">
        <h2>🔥 Hot Off The Press</h2>
        <button class="issue-banner" on:click={goToIssues}>
            <div class="issue-content">
                <h3>{latestIssue.title}</h3>
                <p>Released: {new Date(latestIssue.publication_date).toLocaleDateString()}</p>
                <span class="read-btn">Read Now →</span>
            </div>
        </button>
    </section>
    {/if}

    <section class="latest-feed">
        <h2>The Latest Scoop 🍦</h2>
        
        {#if isLoading}
            <p>Loading the tea... ☕</p>
        {:else if blogs.length === 0}
            <p>No news yet!</p>
        {:else}
            <div class="blog-grid">
                {#each blogs as blog}
                    <button class="mini-card" on:click={() => openPost(blog.id)}>
                        <h4>{blog.title}</h4>
                        <p class="author">By {blog.author}</p>
                        <p class="preview">{blog.content.replace(/<[^>]*>?/gm, '').substring(0, 80)}...</p>
                        <span class="read-link">Read More →</span>
                    </button>
                {/each}
            </div>
        {/if}
    </section>

    <section class="fun-zone">
        <h2>Can't Get Enough? 💅</h2>
        <div class="fun-links">
            
            <a href="https://passion-for-node.vercel.app/" target="_blank" class="fun-btn code">
                <h3>💻 Code with the Bratz</h3>
                <p>Learn Node.js with our passion project!</p>
            </a>

            <a href="https://www.numuki.com/games/bratz/" target="_blank" class="fun-btn game">
                <h3>🎮 Play Minigames</h3>
                <p>Dress up, makeup, and adventure!</p>
            </a>

            <a href="https://www.ea.com/en-gb/games/the-sims/the-sims-4/pc/gallery/E38C85E6B1AE432E892728F4A89DE05E" target="_blank" class="fun-btn sims">
                <h3>💎 Play Sims with the Bratz</h3>
                <p>Download our household for The Sims 4.</p>
            </a>

        </div>
    </section>

</div>

<style>
    .home-container {
        max-width: 900px;
        margin: 0 auto;
        text-align: center;
    }

    .hero {
        padding: 40px 20px;
        background: white;
        border-radius: 15px;
        box-shadow: 0 4px 15px rgba(255, 105, 180, 0.15);
        margin-bottom: 30px;
    }
    .hero h1 {
        color: #d63384;
        font-size: 2.5rem;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    .tagline {
        font-size: 1.2rem;
        color: #666;
        font-style: italic;
    }

    .intro-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 40px;
    }
    .intro-card {
        background: rgba(255, 255, 255, 0.7);
        padding: 20px;
        border-radius: 10px;
        border: 2px solid #fff0f5;
    }
    .intro-card h3 { color: #333; margin-bottom: 10px; }

    .issue-spotlight { margin-bottom: 50px; }
    .issue-spotlight h2 { color: #d63384; margin-bottom: 20px; }
    
    .issue-banner {
        border: none;
        width: 100%;
        text-align: center; 
        font-family: inherit;
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        padding: 40px;
        border-radius: 15px;
        color: white;
        cursor: pointer;
        transition: transform 0.2s;
        box-shadow: 0 5px 15px rgba(255, 105, 180, 0.3);
    }
    .issue-banner:hover { transform: scale(1.02); }
    .issue-content h3 { font-size: 2rem; margin: 0 0 10px 0; text-shadow: 1px 1px 3px rgba(0,0,0,0.1); }
    .read-btn { 
        display: inline-block; 
        background: white; 
        color: #d63384; 
        padding: 10px 20px; 
        border-radius: 20px; 
        margin-top: 15px; 
        font-weight: bold; 
    }

    .fun-zone { margin-bottom: 50px; }
    .fun-zone h2 { color: #d63384; margin-bottom: 20px; }
    
    .fun-links {
        display: flex;
        gap: 20px;
        justify-content: center;
        flex-wrap: wrap;
    }

    .fun-btn {
        flex: 1;
        min-width: 200px;
        padding: 20px;
        border-radius: 15px;
        text-decoration: none;
        color: white;
        transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    .fun-btn:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0,0,0,0.3);
    }
    .fun-btn h3 { margin: 0 0 5px 0; font-size: 1.1rem; }
    .fun-btn p { margin: 0; font-size: 0.9rem; opacity: 0.9; }

    .code { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); } 
    .game { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%); color: #d63384; }
    .game h3, .game p { color: #d63384; font-weight: bold; }
    .sims { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); color: #005c4b; }

    .latest-feed h2 { margin-bottom: 20px; color: #555; }
    .blog-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
    }
    .mini-card {
    border: none;
    width: 100%;
    font-family: inherit;
    background: white;
    padding: 15px;
    border-radius: 8px;
    text-align: left;
    cursor: pointer;
    transition: transform 0.2s;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .mini-card:hover { transform: scale(1.02); }
    .mini-card h4 { margin: 0 0 5px 0; color: #d63384; }
    .author { font-size: 0.8rem; color: #888; margin-bottom: 10px; }
    .read-link { display: block; margin-top: 10px; font-weight: bold; font-size: 0.8rem; color: #333; }

    @media (max-width: 600px) {
        .intro-grid { grid-template-columns: 1fr; }
        .fun-links { flex-direction: column; }
    }
</style>