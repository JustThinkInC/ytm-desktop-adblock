function previousTrack(view) {
    view.webContents.sendInputEvent({ type: 'keydown', keyCode: 'k' })
}

function nextTrack(view) {
    view.webContents.sendInputEvent({ type: 'keydown', keyCode: 'j' })
}

function playPauseTrack(view) {
    view.webContents.sendInputEvent({ type: 'keydown', keyCode: ';' })
}

module.exports = {
    previousTrack: previousTrack,
    nextTrack: nextTrack,
    playPauseTrack: playPauseTrack
}
