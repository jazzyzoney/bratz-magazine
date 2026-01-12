<script>
    import { onMount } from 'svelte';
    import { currentPostId, currentPage } from '../stores/pageStore.js'

    let activeFilter = 'all'
    let blogs = []

    async function loadBlogs(filter) {
        activeFilter = filter
        let url = 'http://localhost:8080/api/blogs?status=published'
        
        if (filter !== 'all') {
            url += `&author=${filter}`
        }

        const res = await fetch(url)
        const data = await res.json()
        blogs = data.data || []
    }

    function openPost(id) {
        $currentPostId = id
        $currentPage = 'blog'
    }

    onMount(() => loadBlogs('all'))
</script>

<div class="corners-container">
    <div class="header-section">
        <h1>Blog updates</h1>
        <p>Keep up with the girls!</p>
    </div>

    <div class="menu">
        <button on:click={() => loadBlogs('all')} class:active={activeFilter === 'all'}>All Updates</button>
        <button on:click={() => loadBlogs('cloe')} class:active={activeFilter === 'cloe'}>Cloe</button>
        <button on:click={() => loadBlogs('jade')} class:active={activeFilter === 'jade'}>Jade</button>
        <button on:click={() => loadBlogs('sasha')} class:active={activeFilter === 'sasha'}>Sasha</button>
        <button on:click={() => loadBlogs('yasmin')} class:active={activeFilter === 'yasmin'}>Yasmin</button>
    </div>

    <div class="grid">
        {#each blogs as blog}
            <button class="card" on:click={() => openPost(blog.id)}> 
                <h3>{blog.title}</h3>
                <p class="author">By {blog.author}</p>
                <p>{blog.content.substring(0, 100)}...</p>
                <span class="read-more">Read More →</span>
            </button>
        {/each}
    </div>
</div>

<style>
    .corners-container { max-width: 1000px; margin: 0 auto; padding: 20px; }
    .header-section { text-align: center; margin-bottom: 30px; }
    .header-section h1 { color: #000000; margin-bottom: 5px; }

    .menu { display: flex; gap: 10px; justify-content: center; margin-bottom: 30px; flex-wrap: wrap;}
    .menu button { padding: 8px 16px; border-radius: 20px; border: 1px solid #ddd; background: white; cursor: pointer; }
    .menu button.active { background-color: #d63384; color: white; border-color: #d63384; }
    
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }

    .card { 
        background: white; 
        padding: 20px; 
        border-radius: 10px; 
        cursor: pointer; 
        transition: transform 0.2s; 
        box-shadow: 0 2px 5px rgba(0,0,0,0.05); 
        
        border: none;
        text-align: left;
        width: 100%;
        font-family: inherit;
        color: inherit;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .card:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
    .card h3 { margin: 0; color: #333; }
    .author { font-size: 0.9rem; color: #888; font-style: italic; margin: 0; }
    .read-more { color: #d63384; font-weight: bold; margin-top: auto; }
</style>