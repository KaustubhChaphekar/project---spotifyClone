let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    let minutesStr = String(minutes).padStart(2, '0');
    let secondsStr = String(remainingSeconds).padStart(2, '0');
    return `${minutesStr}:${secondsStr}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let response = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let element of as) {
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    let songul = document.querySelector(".songList ul");
    songul.innerHTML = "";
    for (const song of songs) {
        songul.innerHTML += `<li>
            <img class="invert" src="music.svg" alt="">
            <div class="info">
                <div>${song.replace(/%20/g, " ")}</div>
                <div>Kaustubh</div>
            </div>
            <div class="playNow">
                <span>Play Now</span>
                <img src="play.svg" alt="">
            </div>
        </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        document.querySelector("#play").src = "pause-btn.svg"; // Assuming the play button has an ID of "play"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00/00:00";
};

async function displayAlbums() {
    let response = await fetch(`http://127.0.0.1:5500/songs`);
    let responseText = await response.text();
    console.log("Fetched HTML:", responseText);

    let div = document.createElement("div");
    div.innerHTML = responseText;

    // Remove the h1 tag and its contents
    let h1 = div.querySelector("h1");
    if (h1) {
        h1.parentNode.removeChild(h1);
    }

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    for (let element of anchors) {
        if (element.href.includes("/songs")) {
            let folder = element.href.split("/").slice(-1)[0]; // Correctly extract the folder name
            try {
                // Get metadata for the folder
                let metadataResponse = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
                if (metadataResponse.ok) {
                    let metadata = await metadataResponse.json();
                    console.log(`Fetched metadata for ${folder}:`, metadata);

                    let cardHTML = `
                        <div data-folder="${folder}" class="card">
                            <div class="play">
                                <img src="play.svg" alt="">
                            </div>
                            <img src="/songs/${folder}/cover.jpeg" alt="">
                            <h2>${metadata.title}</h2>
                            <p>${metadata.description}</p>
                        </div>`;
                    cardContainer.innerHTML += cardHTML;
                } else {
                    console.error(`Failed to load metadata for folder: ${folder}, status: ${metadataResponse.status}`);
                }
            } catch (error) {
                console.error(`Error fetching metadata for folder: ${folder}`, error);
            }
        }
    }

    // Attach click event listeners after all cards have been added
    cardContainer.addEventListener("click", async event => {
        if (event.target.closest(".card")) {
            let card = event.target.closest(".card");
            let folder = card.dataset.folder;
            let songs = await getSongs(`songs/${folder}`);
            console.log(`Fetched songs for ${folder}:`, songs);
            // Process the songs as needed
        }
    });
}


async function main() {
    await getSongs("songs/ncs");
    playMusic(songs[0], true);
    displayAlbums();

    document.querySelector("#play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.querySelector("#play").src = "pause-btn.svg";
        } else {
            currentSong.pause();
            document.querySelector("#play").src = "play-btn.svg";
        }
    });

    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekBar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamBurger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.10;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
