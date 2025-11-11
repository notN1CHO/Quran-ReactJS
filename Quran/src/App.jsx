import React, { useState, useEffect, useRef } from 'react'
import AudioPlayer from './other/Player'
import SurahList from './other/List'
import Controls from './other/Control'

export default function App() {
  const [surahs, setSurahs] = useState([])
  const [audioData, setAudioData] = useState({
    playlist: [],
    currentAyah: 0,
    totalAyahs: 0,
    currentTime: 0,
    duration: 0,
    ayahDurations: []
  })

  const loadIdRef = useRef(0)
  const [playing, setPlaying] = useState(false)
  const [selectedSurah, setSelectedSurah] = useState(null)
  const [reciter, setReciter] = useState('ar.alafasy')
  const [arabs, setArabs] = useState([])
  const [engs, setEngs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingLabel, setLoadingLabel] = useState('')
  const [batchLoading, setBatchLoading] = useState(false)

  useEffect(() => {
    firstloading()
  }, [])

  async function firstloading() {
    await csurahs()
    await crecs()
  }

  async function csurahs() {
    try {
      const reponse = await fetch('https://api.alquran.cloud/v1/surah')
      const data = await reponse.json()
      setSurahs(data.data)
    } catch (error) {
      console.error('error:', error)
    }
  }

  async function crecs() {
    try {
      const reponse = await fetch('https://api.alquran.cloud/v1/edition?format=audio')
      const data = await reponse.json()
      if (data.data && data.data.length > 0) {
      }
    } catch (error) {
      console.error('error:', error)
    }
  }

  async function loadayah(num, selectedReciter = reciter) {
    const loadId = ++loadIdRef.current
    try {
      setIsLoading(true)
      setBatchLoading(true)
      setLoadingProgress(0)
      setLoadingLabel(`Loading Surah ${num}...`)
      setArabs([])
      setEngs([])
      setAudioData(prev => ({
        ...prev,
        playlist: [],
        totalAyahs: 0,
        currentAyah: 0,
        currentTime: 0,
        duration: 0,
        ayahDurations: []
      }))

      const [arabic, english, audiores] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${num}/quran-uthmani`),
        fetch(`https://api.alquran.cloud/v1/surah/${num}/en.asad`),
        fetch(`https://api.alquran.cloud/v1/surah/${num}/${selectedReciter}`)
      ])

      const [arData, enData, adData] = await Promise.all([
        arabic.json(),
        english.json(),
        audiores.json()
      ])

      if (loadId !== loadIdRef.current) return null

      setArabs(arData.data.ayahs)
      setEngs(enData.data.ayahs)

      const playlist = adData.data.ayahs.map(a => a.audio)

      
      setAudioData(prev => ({
        ...prev,
        playlist,
        totalAyahs: adData.data.ayahs.length,
        currentAyah: 0,
        currentTime: 0,
        duration: 0,
        ayahDurations: new Array(playlist.length).fill(0)
      }))
      setSelectedSurah(adData.data)
      const durations = new Array(playlist.length).fill(0)
      let completed = 0
      const batchSize = 10

      for (let start = 0; start < playlist.length; start += batchSize) {
        setBatchLoading(true)
        const end = Math.min(start + batchSize, playlist.length)
        const batch = playlist.slice(start, end)

        await Promise.all(batch.map((url, idx) => {
          return new Promise(resolve => {
            const t = new Audio(url)
            const finish = (val) => {
              durations[start + idx] = isFinite(val) ? val : 0
              completed += 1
              if (loadId === loadIdRef.current) {
                setLoadingProgress(Math.round((completed / playlist.length) * 100))
                setAudioData(prev => ({ ...prev, ayahDurations: durations.slice(), duration: durations.reduce((a, b) => a + (b || 0), 0) }))
              }
              cleanup()
              resolve()
            }
            const onLoaded = () => finish(t.duration)
            const onError = () => finish(0)
            function cleanup() {
              t.removeEventListener('loadedmetadata', onLoaded)
              t.removeEventListener('error', onError)
            }
            t.addEventListener('loadedmetadata', onLoaded, { once: true })
            t.addEventListener('error', onError, { once: true })
            try { t.load() } catch (e) { resolve() }
          })
        }))

        if (loadId !== loadIdRef.current) return null

        setBatchLoading(false)
        if (start === 0) {
          setIsLoading(false)
        }

        if (start + batchSize < playlist.length) {
          setBatchLoading(false)
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      const total = durations.reduce((acc, cur) => acc + (cur || 0), 0)
      setLoadingProgress(100)
      setLoadingLabel(`${adData.data.number}. ${adData.data.englishName} - ${adData.data.name}`)
      setAudioData(prev => ({ ...prev, duration: total, ayahDurations: durations }))
      return adData.data
    } catch (error) {
      console.error('error:', error)
      return null
    } finally {
      if (loadId === loadIdRef.current) {
        setBatchLoading(false)
        setIsLoading(false)
        setTimeout(() => { if (loadId === loadIdRef.current) setLoadingLabel('') }, 400)
      }
    }
  }

  const playayah = (idx) => {
    setAyah(idx)
    setPlaying(true)
    if (audio) {
      audio.pause()
    }
    const newAudio = new Audio(playlist[idx])
    newAudio.volume = vol
    setAudio(newAudio)
    newAudio.play()
  }

  return (
    <div className="main">
      <div className="head">
        <h1><i className="fas fa-book-quran"></i> Quran</h1>
      </div>
      <div className="made">Made by Rayyane IDBELLA</div>

      <Controls 
        surahs={surahs}
        selectedSurah={selectedSurah}
        loadayah={loadayah}
        reciter={reciter}
        setReciter={setReciter}
        setPlaying={setPlaying}
      />

      <SurahList 
        arabs={arabs}
        engs={engs}
        currentAyah={audioData.currentAyah}
        setAudioData={setAudioData}
        setPlaying={setPlaying}
        isLoading={isLoading || batchLoading}
        loadingLabel={loadingLabel}
        loadingProgress={loadingProgress}
      />

      <AudioPlayer 
        audioData={audioData}
        setAudioData={setAudioData}
        selectedSurah={selectedSurah}
        playing={playing}
        setPlaying={setPlaying}
        reciter={reciter}
        loadayah={loadayah}
        isLoading={isLoading}
      />
    </div>
  )
}
