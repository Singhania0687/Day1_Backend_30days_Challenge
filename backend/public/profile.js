window.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await axios.get("http://localhost:3000/profile", {
            withCredentials: true
        });

        const user = response.data.user;

        // Display user data on profile page
        console.log(user.fname)
        document.getElementById("username").innerText = user.fname+" "+user.lname;
        document.getElementById("email").innerText = user.email;

    } catch (err) {
        console.error("Not authenticated", err);
        // window.location.href = "signin.html";   // redirect to login if not authenticated
    }
});


document.getElementById('logout').addEventListener('click',async(e)=>{
    e.preventDefault();
    try{
        await axios.post('http://localhost:3000/logout',{},{withCredentials:true})
        window.location.href='signin.html'
    }
    catch(err){
        console.log(err)
    }

})