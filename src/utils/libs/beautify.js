const logger = require('tracer').colorConsole();

/**
 * This func is making the resume details as beautiful json
 * Resume - resume content
 * func - callback
 */

module.exports = {
  beautify
}

function beautify(Resume, func) {
  const experience = Resume.parts.experience
  Resume.parts.experience = parseExperience(experience)
  // logger.trace('length', strList.length)
  // console.log(Resume)
  func(Resume)
}

function checkIfContainYearOnRow(row) {
  let max = 0;
  let current = 0;
  let flag = false;
  for (let i=0; i<row.length; i++) {
    const ch = row[i];
    if(ch >= '0' && ch <= '9') {
      if(!flag) {
        flag = true;
        current = 1
      } else {
        current++;
      }
    } else {
      flag = false
      if(max < current) {
        max = current
      }
      current = 0
    }
  }
  return max
}

function parseExperience(experience) {
  const list = []
  const strList = experience.split('\n')
  
  let yearIndex = -1, yearList = []
  for (let i=0; i < strList.length; i++) {
    const str = strList[i]
    if(checkIfContainYearOnRow(str) >= 4) {
      if(yearIndex === -1) {
        yearIndex = i
      }
      yearList.push(i)
    }
  }

  for (let i=0; i < yearList.length; i++) {
    const yIndex = yearList[i]
    let yearStr = '', titleStr, descriptionStr = '', startIndex = 0, endIndex = 0
    if (yearIndex === 0) {
      yearStr = strList[yIndex]
      titleStr = strList[yIndex + 1]
      startIndex = yIndex + 2
      endIndex = ((i === yearList.length - 1) ? strList.length - 1 : yearList[i + 1] - 1)
    } else if(yearIndex === 1) {
      yearStr = strList[yIndex]
      titleStr = strList[yIndex - 1]
      startIndex = yIndex + 1
      endIndex = ((i === yearList.length - 1) ? strList.length - 1 : yearList[i + 1] - 2)
    }
    for(let j=startIndex; j<=endIndex; j++) {
      descriptionStr += strList[j] + '\n'
    }

    const startDate = parseDate(yearStr.split(/-|~/)[0])
    const endDate = parseDate(yearStr.split(/-|~/)[1])
    list.push({
      year: yearStr,
      startYear: startDate,
      endYear: endDate,
      title: titleStr,
      description: descriptionStr
    })
  }

  return list
}

function getYearOfTheRow(row) {
  let current = 0;
  let flag = false;
  let year = ''
  for (let i=0; i<row.length; i++) {
    const ch = row[i];
    if(ch >= '0' && ch <= '9') {
      if(!flag) {
        flag = true;
        current = 1
        year = ch
      } else {
        current++;
        year += ch
      }
    } else {
      flag = false
      if(current === 4) {
        return year
      }
      current = 0
      year = ''
    }
  }
  return year
}

function getMonthFromStr(str) {
  const keywords = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
  ]
  let month = null
  keywords.map((keyword, index) => {
    if(str.toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
      month = {
        index: (index % 12) + 1,
        name: keyword
      }
    } 
  })

  return month
}

function checkIfOngoing(str) {
  const keywords = ['Ongoing', 'Present', 'Current']
  let flag = false
  keywords.map(keyword => {
    if(str.toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
      flag = true
    } 
  })
  return flag
}

function parseDate(str) {
  if(!str) {
    return {
      string: '',
    }
  }
  let temp = str.trim()
  const year = getYearOfTheRow(temp)
  temp = temp.replace(year, '')
  const month = getMonthFromStr(temp)
  if(month) {
    temp = temp.replace(month.name, '')
    temp = temp.replace(month.name.toLowerCase(), '')
  }
  temp = temp.trim()
  const day = ((temp.length === 1 && checkIfContainYearOnRow(temp) === 1) || (temp.length === 2 && checkIfContainYearOnRow(temp) === 2)) ? temp : 1
  return {
    string: str,
    year,
    month: month ? month.index : 1,
    day,
    current: checkIfOngoing(str)
  }
}