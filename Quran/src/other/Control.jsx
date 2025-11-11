import React, { useState, useEffect } from 'react'

export default function Control({ surahs, selectedSurah, loadayah, reciter, setReciter, setPlaying }) {
  const [reciters, setReciters] = useState([])
  
  useEffect(() => {
    if (surahs.length > 0 && !selectedSurah) {
      loadayah(surahs[0].number)
    }
  }, [surahs])

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/edition?format=audio')
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          setReciters(data.data)
        }
      })
      .catch(e => console.error('error:', e))
  }, [])

  const handleSurahChange = (e) => {
    loadayah(e.target.value)
  }

  const handleReciterChange = (e) => {
    setReciter(e.target.value)
    if (selectedSurah) {
      loadayah(selectedSurah.number, e.target.value)
    }
  }

  return (
    <div className="ctrls">
      <div className="row">
        <div className="group">
          <label className="label">Reciter</label>
          <select 
            id="rec"
            className="select"
            value={reciter}
            onChange={handleReciterChange}
          >
            {reciters.map(rec => (
              <option key={rec.identifier} value={rec.identifier}>
                {rec.englishName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="group">
          <label className="label">Surah</label>
          <select 
            id="surah"
            className="select"
            value={selectedSurah?.number || ""}
            onChange={handleSurahChange}
          >
            {surahs.map(surah => (
              <option key={surah.number} value={surah.number}>
                {surah.number}. {surah.englishName} - {surah.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <button 
          id="play"
          className="play"
          onClick={async () => {
            if (surahs.length > 0) {
              await loadayah(selectedSurah?.number || surahs[0].number)
              setPlaying(true)
            }
          }}
        >
          <i className="fas fa-play"></i> Start Surah
        </button>
      </div>
    </div>
  )
}