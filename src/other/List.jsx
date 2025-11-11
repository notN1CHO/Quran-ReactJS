import React from 'react'

export default function List({ arabs, engs, currentAyah, setAudioData, setPlaying, isLoading, loadingLabel, loadingProgress }) {
  if (isLoading || !arabs || arabs.length === 0) {
    return (
      <div id="ayahs">
        <div className="load">
          <div className="spin"></div>
          {loadingLabel ? <div className="loading-label">{loadingLabel}</div> : null}
          {typeof loadingProgress === 'number' ? (
            <div className="loading-progress">{loadingProgress}%</div>
          ) : null}
        </div>
      </div>
    )
  }

  const handleAyahClick = (index) => {
    setAudioData(prev => ({ ...prev, currentAyah: index }))
    setPlaying(true)
  }

  return (
    <div id="ayahs">
      {arabs.map((a, index) => (
        <div 
          key={a.numberInSurah}
          className={`ayah-c ${currentAyah === index ? 'on' : ''}`}
          onClick={() => handleAyahClick(index)}
        >
          <div className="ayah-h">
            <div className="ayah-n">{a.numberInSurah}</div>
          </div>
          <div className="arabic">{a.text}</div>
          <div className="trans">{engs[index].text}</div>
        </div>
      ))}
    </div>
  )
}