// API-Endpunkt für FizzBuzz-Berechnungen
app.post('/api/calculate', (req, res) => {
  try {
    const { number, rules } = req.body;
    
    if (!number || !rules || !Array.isArray(rules)) {
      return res.status(400).json({ 
        error: 'Ungültige Anfrage. "number" und "rules" werden benötigt.' 
      });
    }
    
    console.log(`Berechne für Zahl: ${number}, Regeln:`, rules);
    
    let result = '';
    let matched = false;
    
    rules.forEach(rule => {
      if (rule.active && number % rule.divisor === 0) {
        result += rule.word;
        matched = true;
      }
    });
    
    // Wenn keine Regel zutrifft, gib die Zahl zurück
    if (!matched) {
      result = number.toString();
    }
    
    // Logge das Ergebnis
    console.log(`Ergebnis für ${number}: ${result}`);
    
    // Speichere Werte für die Statistik-Middleware
    res.locals.result = result;
    res.locals.number = number;
    
    // Sende das Ergebnis zurück
    res.json({ 
      number: number,
      result: result,
      success: true 
    });
  } catch (error) {
    console.error('Fehler bei der Berechnung:', error);
    res.status(500).json({ 
      error: 'Serverfehler bei der Berechnung',
      message: error.message 
    });
  }
});

// Zählt Berechnungen und aktualisiert Statistiken
// Diese Middleware muss NACH der Route-Definition kommen
app.use('/api/calculate', (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode === 200) {
      calculationCount++;
      
      const result = res.locals.result;
      if (result) {
        resultFrequency[result] = (resultFrequency[result] || 0) + 1;
        lastCalculation = {
          number: res.locals.number,
          result: result,
          timestamp: new Date()
        };
      }
    }
  });
  next();
});
