document.getElementById('signin').addEventListener('submit',async (event)=>{
    event.preventDefault();
    const form=event.target;
    const data=new FormData(form)
           const payload= Object.fromEntries(data.entries())
            // sending data to backend using axios
            try{       
                   const response = await axios.post( "http://localhost:3000/login",payload,{withCredentials: true,headers:{"Content-Type": "application/json"}});
                   window.location.href='profile.html'
              
            }
            catch(err)
           { console.error(err)}

})
