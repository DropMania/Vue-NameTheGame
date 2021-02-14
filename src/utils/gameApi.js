export default {
    async search(section,query){
        let formData = new FormData();
        formData.append('section',section);
        formData.append('query',query)
        let response = await fetch('http://robin-pc/namethegame/gameApiProxy.php',
        { 
            body: formData,
            method: 'POST'
        })
        let data = await response.json();
        return data
    }
}