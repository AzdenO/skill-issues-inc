document.addEventListener("DOMContentLoaded", ()=>{
    loadNav();
});

//////////////////////////////////////////////////////////////////////////////////////////
function loadNav(){
    fetch("assets/elements/navbar.html")
        .then(response => {
            if(!response.ok){
                throw new Error("Cannot load navbar");
            }
            return response.text();
        })
        .then(navbar => {
            const holder = document.createElement("div");
            holder.innerHTML = navbar;
            let master = document.getElementById("master");
            master.prepend(holder);
        })
        .catch(error => {
            console.error("Unable to inject navbar content",error);
        });
}
/////////////////////////////////////////////////////////////////////////////////////////