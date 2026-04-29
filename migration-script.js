// Script de migration des données depuis old_site.html vers la nouvelle app
// À utiliser dans la console du navigateur avec l'ancienne app

function exportCurrentData() {
  const savedData = localStorage.getItem('seriesTrackerData')
  
  if (!savedData) {
    console.error('Aucune donnée trouvée dans localStorage')
    return
  }

  const appData = JSON.parse(savedData)
  
  // Transformer le format ancien vers le nouveau
  const transformedData = {
    manwha: transformType(appData.manwha || {}),
    manga: transformType(appData.manga || {}),
    anime: transformType(appData.anime || {}),
    novel: transformType(appData.novel || {})
  }

  console.log('Données transformées:', transformedData)
  
  // Copier au clipboard
  const jsonString = JSON.stringify(transformedData, null, 2)
  navigator.clipboard.writeText(jsonString).then(() => {
    console.log('✅ Données copiées au clipboard! Vous pouvez les importer dans la nouvelle app.')
  }).catch(err => {
    console.error('Erreur clipboard:', err)
    console.log('Données JSON:', jsonString)
  })

  return jsonString
}

function transformType(typeData) {
  return Object.entries(typeData).map(([categoryName, series]) => {
    return {
      id: Date.now().toString() + Math.random(),
      name: categoryName,
      series: Array.isArray(series) ? series.map(s => transformSeries(s)) : []
    }
  })
}

function transformSeries(oldSeries) {
  return {
    id: oldSeries.id?.toString() || Date.now().toString(),
    name: oldSeries.name,
    status: oldSeries.status || 'ongoing',
    counter1Type: oldSeries.counter1Type || 'chapters',
    counter1Value: oldSeries.counter1Value || 0,
    counter2Type: oldSeries.counter2Type || null,
    counter2Value: oldSeries.counter2Value || null,
    sourceUrl: null,
    tags: [],
    notes: '',
    createdAt: new Date().toISOString(),
    lastUpdated: oldSeries.lastUpdated ? new Date(oldSeries.lastUpdated).toISOString() : new Date().toISOString()
  }
}

// Exporter les données
console.log('🚀 Migration en cours...')
exportCurrentData()
console.log('✅ Migration terminée!')
