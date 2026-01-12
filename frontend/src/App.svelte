<script>
    import { onMount } from 'svelte';
    import Login from './pages/Login.svelte';
    import Home from './pages/Home.svelte'; 
    import Admin from './pages/Admin.svelte';
    import Corners from './pages/Corners.svelte';
    import StyleSOS from './pages/StyleSOS.svelte';
    import Blog from './pages/Blog.svelte'
    import Issues from './pages/Issues.svelte'

    import { user } from './stores/userStore.js';
    import { currentPage } from './stores/pageStore.js';

    import toastr from 'toastr';
    import 'toastr/build/toastr.min.css'

    import io from "socket.io-client";

    toastr.options = {
        "positionClass": "toast-bottom-right",
        "closeButton": true,
        "timeOut": "5000"
    }

    const socket = io("http://localhost:8080")
    socket.on("new_post_alert", (data) => {
        toastr.info(data.message, "New Update!💅")
    })
    
    async function handleLogout() {
        try {
            await fetch("http://localhost:8080/api/logout", { method: "POST", credentials: "include" })
            $user = null;
            $currentPage = 'home'
            toastr.success("You have been logged out.")
        } catch (error) {
            console.error("Logout failed", error)
            toastr.error("Logout failed")
        }
    }

    function navigate(page) {
        $currentPage = page;
    }
</script>

<header>
    <div class="branding">
        <img src="./images/sasha_logo.png" alt="Sasha Logo" class="site-logo" />
        <img src="./images/cloe_logo.png" alt="Cloe Logo" class="site-logo" /> 

        <h1 class="site-title">
            <a href="/" on:click|preventDefault={() => navigate('home')}>
                Bratz Magazine
            </a>
        </h1>

        <img src="./images/jade_logo.png" alt="Jade Logo" class="site-logo" />
        <img src="./images/yasmin_logo.png" alt="Yasmin Logo" class="site-logo" />
    </div>

    <nav>
        <button on:click={() => navigate('home')} class:active={$currentPage === 'home'}>
            🏠 Home
        </button>
        
        <button on:click={() => navigate('corners')} class:active={$currentPage === 'corners'}>
            ✨ Corners
        </button>
        
        <button on:click={() => navigate('sos')} class:active={$currentPage === 'sos'}>
            💋 Style SOS
        </button>

        <button on:click={() => navigate('issues')} class:active={$currentPage === 'issues'}>
            📚 Issues
        </button>
        
        {#if $user && $user.role === 'admin'}
            <button on:click={() => navigate('admin')} class:active={$currentPage === 'admin'}>
                👑 Admin
            </button>
        {/if}

        {#if !$user}
            <button on:click={() => navigate('login')} class:active={$currentPage === 'login'}>
                🔑 Login
            </button>
        {:else}
            <button class="logout-btn" on:click={handleLogout}>
                🚪 Logout
            </button>
        {/if}
    </nav>
</header>

<main>
    <div class="content-card">
        {#key $currentPage} 
            {#if $currentPage === 'home'}
                <Home />
            {:else if $currentPage === 'blog'} 
                <Blog />
            {:else if $currentPage === 'corners'}
                <Corners />
            {:else if $currentPage === 'sos'}
                <StyleSOS />
            {:else if $currentPage === 'issues'}
                <Issues />
            {:else if $currentPage === 'admin'}
                {#if $user && $user.role === 'admin'}
                    <Admin />
                {:else}
                    <p>Access Denied 💅</p>
                {/if}
            {:else if $currentPage === 'login'}
                <Login /> 
            {/if}
        {/key}
    </div>
</main>

<style>
    header {
        background-color: white;
        padding-top: 10px;
        padding-bottom: 10px;
        box-shadow: 0 4px 15px rgba(255, 105, 180, 0.2);
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 30px;
        
        width: 100%;
        position: sticky; 
        top: 0;
        z-index: 1000;
    }

    .branding {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
        margin-bottom: 10px;
        width: 100%;
    }

    .site-logo {
        height: 50px;
        width: auto;
    }

    .site-title {
        margin: 0;
        font-size: 3rem;
        color: #d63384;
        letter-spacing: 2px;
        text-shadow: 2px 2px 0px #ffc0cb;
    }

    .site-title a {
    text-decoration: none; /* Remove underline */
    color: inherit; /* Keep the pink color defined in .site-title */
    cursor: pointer;
    }

    nav { 
        display: flex; 
        gap: 15px; 
        padding: 10px; 
        justify-content: center;
        flex-wrap: wrap;
        width: 100%;
        background-color: rgba(255, 255, 255, 0.9); 
        border-top: 1px solid #ffe4e1;
    }

    button {
        padding: 8px 16px;
        cursor: pointer;
        border: 2px solid transparent;
        background: white;
        border-radius: 25px;
        font-size: 0.9rem;
        font-weight: bold;
        color: #555;
        transition: all 0.2s ease;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }

    button:hover { 
        background-color: #fff0f5; 
        color: #d63384;
        transform: translateY(-2px);
    }

    button.active {
        background-color: #d63384;
        color: white;
        box-shadow: 0 4px 10px rgba(214, 51, 132, 0.4);
    }

    main {
        padding: 20px;
        max-width: 1200px; /* Keeps content readable/centered */
        margin: 0 auto;    /* Centers the main block */
        width: 90%;        /* Adds padding on small screens */
    }

    .content-card {
        background: rgba(255, 255, 255, 0.8);
        padding: 20px;
        border-radius: 20px;
    }

    .logout-btn {
        background-color: #ffebee;
        color: #c62828;
        border: 1px solid #c62828;
    }
    .logout-btn:hover {
        background-color: #c62828;
        color: white;
    }
</style>