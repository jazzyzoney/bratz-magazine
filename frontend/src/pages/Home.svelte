<script>
    import { onMount } from 'svelte';
    import { currentPostId, currentPage } from '../stores/pageStore.js';
    
    let blogs = []
    let isLoading = true
    let errorMsg = ""

    onMount(async () => {
        try {
            const response = await fetch('http://localhost:8080/api/blogs?status=published')
            
            const data = await response.json()
            
            blogs = data.data || []

        } catch (error) {
            console.error("Error:", error)
            errorMsg = "Could not fetch blogs."
        } finally {
            isLoading = false
        }
    });

    function openPost(id) {
        $currentPostId = id 
        $currentPage = 'post'
    }
</script>

<main>
    <h1>✨ Bratz Blog Feed ✨</h1>
    </main>

{#each blogs as blog}
    <div class="blog-card">
        <h2>{blog.title}</h2>
        <p>{blog.content.substring(0, 100)}...</p>
        
        <button class="read-more" on:click={() => openPost(blog.id)}>
            Read More & Comment 💬
        </button>
    </div>
{/each}