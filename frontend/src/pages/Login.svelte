<script>
  import { onMount } from "svelte"
  import { user } from "../stores/userStore.js"
  import { currentPage } from "../stores/pageStore.js"
  import toastr from 'toastr'
  import 'toastr/build/toastr.min.css'

  let email = ""
  let password = ""

  onMount(async () => {
    toastr.options = {
      "closeButton": true,
      "progressBar": true,
      "positionClass": "toast-top-right",
      "timeOut": "5000",
    }

    try {
      const res = await fetch("http://localhost:8080/api/auth-check", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()

        if (data.user) {
            $user = data.user;
            $currentPage = 'home'
        }
      }
    } catch (e) {
      console.log("Not logged in")
    }
  })

  async function handleSignup() {
    if(!email || !password) return toastr.warning("Please fill in all fields")
    
    try {
      const res = await fetch("http://localhost:8080/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      })

      const data = await res.json()
      if (res.ok) {
        toastr.success("Account created. You can now login", "Success")
      } else {
        toastr.error(data.message, "Signup failed")
      }

    } catch (error) {
        toastr.error("Network error")
    }
  }

  async function handleLogin() {
    if(!email || !password) return toastr.warning("Please fill in all fields")

    try {
      const res = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      })

      const data = await res.json()

      if (res.ok) {
        $user = data.user
        toastr.success("Welcome back!", "Login Successful")
        $currentPage = 'home'
      } else {
        toastr.error(data.message, "Login Failed")
      }
    } catch (error) {
        toastr.error("Network error")
    }
  }

</script>

<main>
    <div class="card">
      <h1>Login / Sign Up</h1>
      <input type="email" bind:value={email} placeholder="Email"/>
      <input type="password" bind:value={password} placeholder="Password"/>
      
      <div class="buttons">
        <button on:click={handleLogin}>
            Login
        </button>
        
        <button class="secondary" on:click={handleSignup}>
            Sign Up
        </button>
      </div>
    </div>
</main>

<style>
  main { max-width: 400px; margin: 60px auto; text-align: center; }
  .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  input { width: 90%; padding: 12px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; }
  
  .buttons { display: flex; gap: 10px; justify-content: center; }
  
  button { padding: 10px 20px; background: #333; color: white; border: none; cursor: pointer; border-radius: 4px; font-weight: bold;}
  button:hover { opacity: 0.9; }
  button:disabled { background: #ccc; cursor: not-allowed; }
  
  /* Different style for Sign Up */
  .secondary { background: #d63384; }
</style>