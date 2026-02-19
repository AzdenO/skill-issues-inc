document.addEventListener("DOMContentLoaded", () => {
    loadThirdParty();
});


/////////////////////////////////////////////////////////////////////////////////////////
/**
 * Function that will dynamically inject
 * @author AzdenO
 */
function loadThirdParty() {
    fetch("assets/json/third-party-tools.json").then(response => {
        if(!response.ok){
            return new Error("Unable to load json content");
        }
        return response.json();
    }).then(content => {
        const container = document.getElementById("thirdpartytools");
        const template = document.getElementById("tooltemplate");
        content.tools.forEach(tool => {
            const clone = template.content.cloneNode(true);
            clone.querySelector("#toolname").innerText = tool.name;
            clone.querySelector("#toolname").href = tool.url;
            clone.querySelector("#tooldesc").innerText = tool.description;
            clone.querySelector("#toolicon").src = tool.icon;
            container.appendChild(clone);
        });
    })

}

////////////////////////////////////////////////////////////////////////////////////////