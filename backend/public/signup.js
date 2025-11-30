const uuid= crypto.randomUUID();
document.getElementById('formData').addEventListener('submit',async (event)=>{
    event.preventDefault();
   
    const form=event.target;
    const data=new FormData(form)
    // Generating unique device id
    const deviceId=uuid;
            
           const payload= Object.fromEntries(data.entries())
          
            // sending data to backend using axios
            try{
           const response=await axios.post('http://localhost:3000/userRegistration',payload,{headers:{deviceId:deviceId}})
            }
            catch(err)
           { console.error(err)}

})
