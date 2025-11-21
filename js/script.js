console.log('Lets write JavaScript');

let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Convert seconds to mm:ss
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// NEW: Load songs from info.json instead of scanning folder
async function getSongs(folder) {
    currFolder = folder;

    const res = await fetch(`/${folder}/info.json`);
    const data = await res.json();

    songs = data.songs; // Array of song names

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img class="invert" width="34" src="/img/music.svg" alt="">
                <div class="info">
                    <div>${song}</div>
                    <div>Artist</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="/img/play.svg" alt="">
                </div>
            </li>`;
    }

    // Click to play
    Array.from(songUL.querySelectorAll("li")).forEach(li => {
        li.addEventListener("click", () => {
            playMusic(li.querySelector(".info").firstElementChild.innerText.trim());
        });
    });

    return songs;
}

// Play selected track
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;

    if (!pause) {
        currentSong.play();
        play.src = "/img/pause.svg";
    }

    document.querySelector(".songinfo").innerText = decodeURI(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
};

// Display album cards
async function displayAlbums() {
    let res = await fetch(`/songs/albums.json`); 
    let albums = await res.json();

    let cardContainer = document.querySelector(".cardContainer");

    albums.forEach(album => {
        cardContainer.innerHTML += `
            <div data-folder="${album.folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24">
                        <path d="M5 20V4L19 12L5 20Z" fill="#000"/>
                    </svg>
                </div>

                <img src="/songs/${album.folder}/cover.jpg" alt="">
                <h2>${album.title}</h2>
                <p>${album.description}</p>
            </div>
        `;
    });

    // Album click event
    Array.from(document.querySelectorAll(".card")).forEach(card => {
        card.addEventListener("click", async () => {
            songs = await getSongs(`songs/${card.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

// MAIN FUNCTION
async function main() {
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    await displayAlbums();

    // Play/Pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "/img/play.svg";
        }
    });

    // Update progress
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Sidebar toggle
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Previous
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    });

    // Next
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index + 1 < songs.length) playMusic(songs[index + 1]);
    });

    // Volume slider
    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = e.target.value / 100;

        document.querySelector(".volume img").src =
            currentSong.volume === 0 ? "/img/mute.svg" : "/img/volume.svg";
    });

    // Mute toggle
    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "/img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = "/img/volume.svg";
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
