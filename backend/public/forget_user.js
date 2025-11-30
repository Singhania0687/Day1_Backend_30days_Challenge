document.getElementById('forgetUser').addEventListener('submit',async(event)=>{
    event.preventDefault();
    const target=event.target;
    const data=new FormData(target)
    const payload=Object.fromEntries(data.entries())
    axios.post('http://localhost:3000/forgetPassword',payload)
     .then((response)=>{
        console.log(response)
     })
     .catch((err)=>{
        console.error(err)
     })

})