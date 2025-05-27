let lista = [
    {"imie": "Dawid", "quizy": [100, 95, 80], "data": "03.04.2025", "czas": "30", "zdjecie": "Trippi_Troppi2.png"},
    {"imie": "Michał", "quizy": [85, 90, 78], "data": "08.02.2025", "czas": "160", "zdjecie": "Liri.png"},
    {"imie": "Piotr", "quizy": [80, 100, 15], "data": "31.03.2025", "czas": "456", "zdjecie": "banan.png"},
    {"imie": "Jacek", "quizy": [45, 60, 50], "data": "01.04.2025", "czas": "2137", "zdjecie": "brr.png"},
    {"imie": "Szymon", "quizy": [90, 85, 80], "data": "23.02.2025", "czas": "69", "zdjecie": "Frulla.png"},
    {"imie": "Kamil", "quizy": [100, 100, 40], "data": "23.02.2025", "czas": "69", "zdjecie": "gus.png"}
];



lista.forEach(item => {
    item.suma = item.quizy.reduce((a, b) => a + b, 0); 
});


let ranking = lista.sort((a, b) => b.suma - a.suma);


ranking.forEach((item, index) => {
    item.rank = index + 1;
});


function displayRanking() {
    let podiumContainer = document.querySelector('.podium-container');
    let graczeContainer = document.querySelector('.gracze');

   
    let podium = ranking.slice(0, 3);
    podium.forEach((item, index) => {
        let podiumDiv = document.createElement('div');
        podiumDiv.className = `podium ${index === 0 ? 'pierwszy' : index === 1 ? 'drugi' : 'trzeci'}`;
        podiumDiv.innerHTML = `
            <img src="${item.zdjecie}" alt="${item.imie}" />
            <strong> ${item.imie}</strong><br>Punkty: ${item.suma}`;
        podiumContainer.appendChild(podiumDiv);
    });

   
    let gracze = ranking.slice(3);
    gracze.forEach(item => {
        let gracz = document.createElement('p');
        gracz.innerHTML = `
            <img src="${item.zdjecie}" alt="${item.imie} " />
            <strong> <br> ${item.imie}</strong> - Punkty: ${item.suma}`;
        graczeContainer.appendChild(gracz);
    });
}
displayRanking();
