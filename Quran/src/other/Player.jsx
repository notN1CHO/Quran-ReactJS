import React, { useState, useEffect, useRef } from 'react'

export default function Player({ audioData, setAudioData, selectedSurah, playing, setPlaying, reciter, loadayah, isLoading }) {
  const [volume, setVolume] = useState(0.7)
  const [lastVolume, setLastVolume] = useState(volume)
  
  const [ayahDurations, setAyahDurations] = useState([])
  const [totalDuration, setTotalDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef(null)
  const { playlist, currentAyah, totalAyahs, duration: appDuration, ayahDurations: appAyahDurations } = audioData

  useEffect(() => {
    async function calculateDurations() {

      if (appAyahDurations && appAyahDurations.length === playlist.length) {
        setAyahDurations(appAyahDurations)
        setTotalDuration(appDuration || appAyahDurations.reduce((a, b) => a + (b || 0), 0))
        return
      }

      const durations = []
      let total = 0
      
      const promises = playlist.map((url, index) => {
        return new Promise(resolve => {
          const temp = new Audio(url)
          const onLoaded = () => {
            durations[index] = isFinite(temp.duration) ? temp.duration : 0
            cleanup()
            resolve()
          }
          const onError = () => {
            durations[index] = 0
            cleanup()
            resolve()
          }
          function cleanup() {
            temp.removeEventListener('loadedmetadata', onLoaded)
            temp.removeEventListener('error', onError)
          }
          temp.addEventListener('loadedmetadata', onLoaded, { once: true })
          temp.addEventListener('error', onError, { once: true })
          try { temp.load() } catch (e) {}
        })
      })
      
      await Promise.all(promises)
      total = durations.reduce((acc, curr) => acc + (curr || 0), 0)
      
      setAyahDurations(durations)
      setTotalDuration(total)
    }

    if (playlist.length > 0) {
      const loadAudio = async () => {
        try {
          if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
          }
          await calculateDurations()
          const newAudio = new Audio(playlist[currentAyah])
          newAudio.volume = volume

          newAudio.onended = () => {
            if (currentAyah < playlist.length - 1) {
              setAudioData(prev => ({ ...prev, currentAyah: prev.currentAyah + 1 }))
            } else {
              setPlaying(false)
            }
          }
          newAudio.ontimeupdate = updateProgress
          
          audioRef.current = newAudio
          if (playing) {
            try {
              await newAudio.play()
            } catch (e) {
              setPlaying(false)
            }
          }
        } catch (e) {
          setPlaying(false)
        }
      }
      
      loadAudio()
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [playlist, currentAyah])

  useEffect(() => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
    }
  }, [playing])

  const handleNext = async () => {
    if (selectedSurah && selectedSurah.number < 114) {
      setPlaying(false)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      await loadayah(selectedSurah.number + 1)
      setAudioData(prev => ({ ...prev, currentAyah: 0 }))
      setPlaying(true)
    } else {
      handleStop()
    }
  }

  const handlePrev = async () => {
    if (selectedSurah && selectedSurah.number > 1) {
      setPlaying(false)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      await loadayah(selectedSurah.number - 1)
      setAudioData(prev => ({ ...prev, currentAyah: 0 }))
      setPlaying(true)
    }
  }

  const handleStop = () => {
    setPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setCurrentTime(0)
    setAudioData(prev => ({ ...prev, currentAyah: 0 }))
  }

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = Math.floor(sec % 60)
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const updateProgress = () => {
    if (!audioRef.current) return
    let elapsed = 0
    for (let i = 0; i < currentAyah; i++) {
      elapsed += ayahDurations[i] || 0
    }
    elapsed += audioRef.current.currentTime || 0
  setCurrentTime(elapsed)
  }

  

  const handleVolumeChange = (e) => {
    const bar = e.currentTarget
    const rect = bar.getBoundingClientRect()
    let newVolume = (e.clientX - rect.left) / rect.width
    newVolume = Math.max(0, Math.min(1, newVolume))
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    setVolume(newVolume)
  }

  const toggleMute = () => {
    if (volume === 0) {
      const newVolume = lastVolume > 0 ? lastVolume : 0.7
      setVolume(newVolume)
      if (audioRef.current) {
        audioRef.current.volume = newVolume
      }
    } else {
      setLastVolume(volume)
      setVolume(0)
      if (audioRef.current) {
        audioRef.current.volume = 0
      }
    }
  }

  

  const volumeIcon = volume === 0 ? 'mute' : volume < 0.5 ? 'down' : 'up'

  return (
    <div className={`media ${playlist.length > 0 ? 'on' : ''}`} id="player">
      <div className="pbox">
        <div className="info">
          <div className="info-t" id="title">
            {selectedSurah ? `${selectedSurah.number}. ${selectedSurah.name}` : 'Select Surah'}
          </div>
          <div className="info-s" id="sub">Ayah {currentAyah + 1}</div>
          <div className="info-a" id="ayahcount">{totalAyahs} Ayahs</div>
        </div>
        
        <div className="p-ctrls">
          <button className="btn-c" onClick={handlePrev} title="Previous" disabled={isLoading}>
            <i className="fas fa-step-backward"></i>
          </button>
          
          <button className="btn-pp" 
            onClick={async () => {
              try {
                if (playing) {
                  if (audioRef.current) {
                    audioRef.current.pause()
                  }
                  setPlaying(false)
                } else {
                  if (audioRef.current) {
                    await audioRef.current.play()
                    setPlaying(true)
                  }
                }
              } catch (e) {
                setPlaying(false)
              }
            }}
            disabled={isLoading}
          >
            <i className={`fas fa-${playing ? 'pause' : 'play'}`}></i>
          </button>
          
          <button className="btn-c" onClick={handleNext} title="Next" disabled={isLoading}>
            <i className="fas fa-step-forward"></i>
          </button>
          
          <button className="btn-c" onClick={handleStop} disabled={isLoading}>
            <i className="fas fa-stop"></i>
          </button>
        </div>
        
        <div className="prgs-s">
          <span className="time">{formatTime(currentTime)}</span>
          <div className="prgs-c">
            <div 
              className="prgs-bar" 
              id="bar"

            >
              <div 
                className="prgs-fill" 
                style={{ width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%` }}
              >
                <div className="prgs-h"></div>
              </div>
            </div>
          </div>
          <span className="time">{formatTime(totalDuration)}</span>
        </div>
        
        <div className="vol-s">
          <i 
            className={`fas fa-volume-${volumeIcon} btn-c`}
            onClick={toggleMute}
          ></i>
          <div className="vol-c">
            <div 
              className="vol-sl"
              onClick={handleVolumeChange}
            >
              <div 
                className="vol-fill" 
                style={{ width: `${volume * 100}%` }}
              >
                <div className="vol-h"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}