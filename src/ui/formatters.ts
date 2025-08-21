export const fmt = {
  shortNumber(n: number): string {
    if (n >= 1000000) {
      return (n / 1000000).toFixed(1) + 'M'
    }
    if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'k'
    }
    return n.toString()
  },
  
  dateTick(d: string | number): string {
    const date = new Date(d)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // If within 14 days, show day of week
    if (diffDays <= 14) {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  },
  
  percent(p: number): string {
    return Math.round(p) + '%'
  },
  
  // Additional utility for moving averages in charts
  movingAverage<T extends Record<string, number>>(data: T[], key: keyof T, window: number): T[] {
    if (data.length < window) return data
    
    return data.map((item, index) => {
      if (index < window - 1) return item
      
      const windowData = data.slice(index - window + 1, index + 1)
      const sum = windowData.reduce((acc, val) => acc + (val[key] || 0), 0)
      const average = sum / window
      
      return {
        ...item,
        [key]: Math.round(average)
      }
    })
  }
};
