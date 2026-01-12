<script>
    import { marked } from 'marked';
    import { onMount } from 'svelte';
    import { user } from '../stores/userStore.js';
    import { currentPostId, currentPage } from '../stores/pageStore.js';
    
    import toastr from 'toastr';
    import 'toastr/build/toastr.min.css';

    let blog = null
    let comments = []
    let newComment = ""

    onMount(async () => {
        if (!$currentPostId) {
            $currentPage = 'corners'
            return
        }
        await loadBlog()
        await loadComments()
    })

    async function loadBlog() {
        try {
            const res = await fetch(`http://localhost:8080/api/blogs/${$currentPostId}`)
            const data = await res.json()
            blog = data.data;
        } catch (error) { toastr.error("Failed to load blog") }
    }

    async function loadComments() {
        try {
            const res = await fetch(`http://localhost:8080/api/comments/${$currentPostId}`)
            const data = await res.json()
            comments = data.data || []
        } catch (error) { console.error(error) }
    }

    async function postComment() {
        if (!newComment.trim()) return

        try {
            const res = await fetch('http://localhost:8080/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blogId: $currentPostId, content: newComment }),
                credentials: 'include'
            })
            
            if (res.ok) {
                newComment = ""
                loadComments()
                toastr.success("Comment posted!")
            } else {
                toastr.error("Failed to post comment.")
            }
        } catch (error) { toastr.error("Network error.") }
    }

    async function deleteComment(id) {
        try {
            const res = await fetch(`http://localhost:8080/api/comments/${id}`, {
                method: 'DELETE', credentials: 'include'
            })

            if(res.ok) {
                toastr.success("Comment deleted")
                loadComments()
            }
        } catch (error) { toastr.error("Failed to delete comment"); }
    }

    async function deleteBlog() {
        try {
            const res = await fetch(`http://localhost:8080/api/blogs/${$currentPostId}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (res.ok) {
                toastr.success("Blog post deleted.")
                $currentPage = 'corners'
            } else {
                const data = await res.json()
                toastr.error(data.error || "Failed to delete.")
            }
        } catch (error) {
            toastr.error("Network error.")
        }
    }
</script>

<div class="single-post-container">
    <button class="back-btn" on:click={() => $currentPage = 'corners'}>← Back to Corners</button>

    {#if blog}
        <article>
            <div class="header-row">
                <h1>{blog.title}</h1>
                
                {#if $user && $user.role === 'admin'}
                    <button class="delete-btn" on:click={deleteBlog}>🗑️ Delete </button>
                {/if}
            </div>

            <p class="meta">By {blog.author} • {new Date(blog.created_at).toLocaleDateString()}</p>
            
            <div class="blog-body">
                {@html marked.parse(blog.content)} 
            </div>
        </article>

        <section class="comments-section">
            <h3>Comments ({comments.length})</h3>

            <div class="comments-list">
                {#each comments as c}
                    <div class="comment {c.role === 'admin' ? 'bratz-reply' : ''}">
                        <div class="comment-content">
                            <strong>{c.username} {c.role === 'admin' ? '👑' : ''}:</strong>
                            <span>{c.content}</span>
                        </div>

                        {#if $user && $user.role === 'admin'}
                            <button class="icon-btn" on:click={() => deleteComment(c.id)}>🗑️</button>
                        {/if}
                    </div>
                {/each}
            </div>

            {#if $user}
                <div class="comment-box">
                    <textarea bind:value={newComment} placeholder={$user.role === 'admin' ? "Reply as a Bratz..." : "Leave a comment..."}></textarea>
                    <button class="post-btn" on:click={postComment}>Post</button>
                </div>
            {:else}
                <p><i>Login to join the conversation!</i></p>
            {/if}
        </section>
    {:else}
        <p>Loading...</p>
    {/if}
</div>

<style>
    .single-post-container { max-width: 800px; margin: 0 auto; padding: 20px; background: white; border-radius: 10px; margin-top: 20px;}
    .back-btn { background: none; border: none; color: #d63384; cursor: pointer; margin-bottom: 20px; font-weight: bold;}
    
    article { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
    
    .header-row { display: flex; justify-content: space-between; align-items: center; }
    h1 { color: #000000; margin: 0; }
    
    .meta { color: #888; font-size: 0.9rem; margin-bottom: 20px; margin-top: 5px; }
    .blog-body { line-height: 1.6; white-space: pre-wrap; }

    .comment { padding: 10px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: flex-start; }
    .comment strong { color: #555; margin-right: 5px; }
    .bratz-reply { background-color: #fff0f5; border-left: 4px solid #ff69b4; border-radius: 4px; }
    .bratz-reply strong { color: #d63384; }

    .comment-box { display: flex; gap: 10px; margin-top: 20px; }
    textarea { flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 5px; min-height: 40px;}
    
    .post-btn { background: #d63384; color: white; border: none; padding: 0 20px; border-radius: 5px; cursor: pointer; }
    
    /* Delete Buttons */
    .delete-btn { 
        background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 0.8rem;
    }
    .icon-btn { background: none; border: none; cursor: pointer; font-size: 0.9rem; margin-left: 10px; opacity: 0.6; }
    .icon-btn:hover { opacity: 1; }
</style>