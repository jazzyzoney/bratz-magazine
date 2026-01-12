<script>
    import { marked } from 'marked';
    import { onMount } from 'svelte';

    import { user } from '../stores/userStore';

    import toastr from 'toastr';
    import 'toastr/build/toastr.min.css'
    
    let issues = []
    let selectedIssue = null

    async function loadIssues() {
        const res = await fetch('http://localhost:8080/api/issues')
        const data = await res.json()
        issues = data.data
    }

    async function openIssue(id) {
        const res = await fetch(`http://localhost:8080/api/issues/${id}`)
        const data = await res.json()
        selectedIssue = data
    }

    async function deleteIssue(id, event) {
        event.stopPropagation()

        try {
        const res = await fetch(`http://localhost:8080/api/issues/${id}`, {
            method: 'DELETE', credentials: 'include'
        })

        if(res.ok) {
            toastr.success("Magazine deleted.")
            loadIssues()
        } else {
            const data = await res.json();
                toastr.error(data.error || "Failed to delete.");
            }
        } catch (error) {
            console.error(error);
            toastr.error("Network error. Could not delete.");
        }
    }

    onMount(loadIssues)
</script>

<div class="magazine-rack">
    {#if !selectedIssue}
        <h1>📚 Magazine archive</h1>
        <div class="grid">
            {#each issues as iss}
                <button class="issue-cover" on:click={() => openIssue(iss.id)}>
                    <div class="logo">BRATZ</div>
                    <h2>{iss.title}</h2>

                    <p>Released: {new Date(iss.publication_date).toLocaleDateString()}</p>
                    <span class="fake-btn">Read Issue</span>

                    {#if $user && $user.role === 'admin'}
                        <button class="delete-issue-btn" on:click={(e) => deleteIssue(iss.id, e)}>🗑️ Delete</button>
                    {/if}
                </button>
            {/each}
        </div>

    {:else}
        <div class="reader">
            <button class="close-btn" on:click={() => selectedIssue = null}>Close Magazine ✖</button>
            
            <header class="mag-header">
                <h1>{selectedIssue.issue.title}</h1>
            </header>

            <div class="columns-layout">
                {#each selectedIssue.columns as col}
                    <div class="column-page {col.author.toLowerCase()}">
                        <h3>{col.topic}</h3>
                        <p class="author">By {col.author}</p>
                        <hr>
                        <p class="text">{@html marked.parse(col.content)}</p>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    .issue-cover { 
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        padding: 40px; 
        text-align: center; 
        border-radius: 5px; 
        cursor: pointer; 
        color: white;
        box-shadow: 5px 5px 15px rgba(0,0,0,0.2); 
        transition: transform 0.2s;
        
        border: none;
        width: 100%;
        display: block;
        font-family: inherit;
    }
    .issue-cover:hover { transform: scale(1.05); }

    .fake-btn {
        background: white;
        color: #d63384;
        padding: 5px 15px;
        border-radius: 15px;
        font-weight: bold;
        font-size: 0.9rem;
        display: inline-block;
        margin-top: 10px;
    }
    
    .logo { font-size: 2rem; font-weight: bold; letter-spacing: 5px; margin-bottom: 20px; }

    .reader { background: #fdfdfd; min-height: 100vh; padding: 20px; }
    .columns-layout { 
        display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; 
        max-width: 1200px; margin: 0 auto;
    }
    .column-page { 
        background: white; padding: 20px; border: 1px solid #ddd; 
        box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        font-family: 'Times New Roman', serif;
    }
    .column-page h3 { text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid black; padding-bottom: 10px; }
    
    .jade h3 { border-color: #39ff14; color: #333; }
    .cloe h3 { border-color: #ff69b4; color: #d63384; }
    .yasmin h3 { border-color: #fbc2eb; color: #a18cd1; }
    .sasha h3 { border-color: #edde5d; color: #f09819; }

    .delete-issue-btn {
        display: block; 
        background: #dc3545; 
        color: white; 
        padding: 5px; 
        border-radius: 5px; 
        margin-top: 10px;
        font-size: 0.8rem;
    }
</style>