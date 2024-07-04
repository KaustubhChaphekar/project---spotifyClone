let currentSong = new Audio();
let songs
let currFolder
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    // Calculate minutes and remaining seconds
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    // Pad with leading zeros if necessary
    let minutesStr = String(minutes).padStart(2, '0');
    let secondsStr = String(remainingSeconds).padStart(2, '0');

    // Return the formatted time
    return `${minutesStr} : ${secondsStr}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let reponse = await a.text();

    let div = document.createElement("div")
    div.innerHTML = reponse;
    let as = div.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //Show all the song in the playList
    let songul = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {

        songul.innerHTML = songul.innerHTML + `<li> 
      
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Kaustubh</div>
                            </div>
                            <div class="playNow">
                                <span>Play Now</span>
                                <img src="img/play.svg" alt="">
                            </div>
    
        </li>`;
    }

    //Attach event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause-btn.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00/00:00"

}

async function displayAlbums() {
    let a = await fetch(`/songs`)
    let reponse = await a.text();
    let div = document.createElement("div")
    div.innerHTML = reponse

    // Remove the h1 tag and its contents
    let h1 = div.querySelector("h1")
    if (h1) {
        h1.parentNode.removeChild(h1)
    }
    console.log(div);

    let anchor = div.getElementsByTagName("a")


    let cardContainer = document.querySelector(".cardContainer")

    Array.from(anchor).slice(1).forEach(async element => {

        if (element.href.includes("/songs/")) {
            let folder = element.href.split("/").slice(-1)[0]
            console.log(folder);

            //get metadata for the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let reponse = await a.json();
            cardContainer.innerHTML += `  <div data-folder="${folder}"         class="card">
                    <div class="play">
                     <img src="img/play.svg" alt="">
                     </div>
                     <img src="/songs/${folder}/cover.jpeg" alt="">
                     <h2>${reponse.title}</h2>
                     <p>${reponse.description}</p>
                     </div>`
        }
    });



    // load thee playlist whenever card is clicked
    cardContainer.addEventListener("click", async event => {
        if (event.target.closest(".card")) {
            let card = event.target.closest(".card");
            let folder = card.dataset.folder;
            let songs = await getSongs(`songs/${folder}`);
            // Process the songs as needed
        }
        playMusic(songs[0])
    });


}

async function main() {
    //get the list of all the songs
    await getSongs(`songs/k`)

    playMusic(songs[0], true)

    //display all the albums on the page
    displayAlbums()

    // Attach an event listener to play, next and previous
    document.querySelector("#play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.querySelector("#play").src = "img/pause-btn.svg";
        } else {
            currentSong.pause();
            document.querySelector("#play").src = "img/play-btn.svg";
        }
    });

    //previous and next button
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })


    //listen for time update event 
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // add event listner to seekBar
    document.querySelector(".seekBar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // add event listner for hamBurger
    document.querySelector(".hamBurger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    // add event listner for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //add event to a volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100

    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })

    //open a login form
    document.getElementById('loginButton').addEventListener('click', function() {
        window.location.href = 'LoginForm.html';
    });


}
main()